backend ammit_service {
	.connect_timeout = 1s;
	.dynamic = true;
	.port = "80";
	.host = "ft-next-ab.herokuapp.com";
	.host_header = "ft-next-ab.herokuapp.com";
	.first_byte_timeout = 15s;
	.max_connections = 200;
	.between_bytes_timeout = 10s;

	.probe = {
		.request = "HEAD /__gtg HTTP/1.1" "Host: ft-next-ab.herokuapp.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
		.threshold = 1;
		.window = 2;
		.timeout = 5s;
		.initial = 1;
		.expected_response = 200;
		.interval = 30s;
	}
}

sub vcl_recv {
	#FASTLY recv

	set req.backend = ammit_service;
	set req.http.Host = "ft-next-ab.herokuapp.com";

	# Force SSL
	if (!req.http.Fastly-SSL) {
		error 801 "Force TLS";
	}

	set req.http.Protocol = "https://";

	log {"syslog ${SERVICEID} ft-next-syslog-server :: "} {" event=AMMIT_REQUEST url="} req.url {" method="} req.request;

	return(lookup);
}

sub vcl_fetch {
	#FASTLY fetch

	if (beresp.status >= 500 && beresp.status < 600) {
		# deliver stale if the object is available
		if (stale.exists) {
			return(deliver_stale);
		}

		# Attempt restart
		if (req.restarts < 1 && (req.request == "GET" || req.request == "HEAD")) {
			restart;
		}
	}

	if(req.restarts > 0 ) {
		set beresp.http.Fastly-Restarts = req.restarts;
	}


	if (beresp.http.Set-Cookie) {
		set req.http.Fastly-Cachetype = "SETCOOKIE";
		return (pass);
	}

	if (beresp.http.Expires || beresp.http.Surrogate-Control ~ "max-age" || beresp.http.Cache-Control ~"(s-maxage|max-age)") {
		# keep the ttl here
	} else {
		# apply the default ttl
		set beresp.ttl = 3600s;
	}

	if (beresp.http.Cache-Control ~ "private") {
		set req.http.Fastly-Cachetype = "PRIVATE";
		return (pass);
	}

	if (beresp.status == 500 || beresp.status == 503) {
		set req.http.Fastly-Cachetype = "ERROR";
		set beresp.ttl = 1s;
		set beresp.grace = 5s;
		return (deliver);
	}

	log {"syslog ${SERVICEID} ft-next-syslog-server :: "} {" event=BACKEND_RESPONSE status="} beresp.status {"  "};

	return(deliver);
}

sub vcl_hit {
	#FASTLY hit
	log {"syslog ${SERVICEID} ft-next-syslog-server :: "} {" event=CACHE_HIT url="} req.url;

	if (!obj.cacheable) {
		return(pass);
	}

	return(deliver);
}

sub vcl_miss {
	#FASTLY miss
	log {"syslog ${SERVICEID} ft-next-syslog-server :: "} {" event=CACHE_MISS url="} req.url;
	return(fetch);
}

sub vcl_deliver {
	#FASTLY deliver

	if (req.http.X-FT-Cachable) {
		set resp.http.X-FT-Cachable = req.http.X-FT-Cachable;
	}

	if (req.http.X-Timer) {
		set resp.http.X-Timer = req.http.X-Timer ",VE" time.elapsed.msec;
	}

	if(req.http.Error-Message){
		set resp.http.Error-Message = req.http.Error-Message;
	}

	set resp.http.CDN-Cache-Control = resp.http.Cache-Control;

	# Copy the outbound-cache-control headers to cache-control, otherwise 'no-cache'
	if (resp.http.Outbound-Cache-Control) {
		set resp.http.Cache-Control = resp.http.Outbound-Cache-Control;
		unset resp.http.Outbound-Cache-Control;
	} else {
		set resp.http.Cache-Control = "no-cache, no-store, must-revalidate, max-age=0";
	}

	log {"syslog ${SERVICEID} ft-next-syslog-server :: "} {" event=FASTLY_DELIVER"} {" start_time="} req.http.X-Timer-Msec {" end_time="} time.elapsed.msec {" url="} req.url {" access_response="} req.http.X-FT-Auth-Gate-Result {" restarts="} req.restarts;

	return(deliver);
}

sub vcl_error {
	#FASTLY error
	log {"syslog ${SERVICEID} ft-next-syslog-server :: "} {" event=FASTLY_ERROR url="} req.url {" status="} obj.status {" stale.exists="} stale.exists;
}

sub vcl_pass {
	#FASTLY pass
	log {"syslog ${SERVICEID} ft-next-syslog-server :: "} {" event=CACHE_PASS url="} req.url;
}

