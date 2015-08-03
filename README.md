
This application is a simple API for segmenting users in to AB test buckets. 

The aim of the API is to provide consistent and evenly distributed segmentation
based either on your FT Membership GUID (typically derived from your session
token) or, in the case of anonymous users, a mechanism to generate a temporary
token than can be stored on the device (Eg, a cookie) and sent back with each
subsequent request.

## Use cases

- The CDN can hit the API to segment each response in to buckets, allowing it
to vary responses. 
- An application (say, something that sends an email) can hit the API and use
the response to send different users different content each day.
- A client-side app can hit the API, segment the user and run a simple
client-side AB test.

## Usage 

Segment a registered user based on their FT Session token,

	curl -i -H 'ft-session-token: z3MN_fJbrE...' localhost:5050/uk
	
... and the response contains the result of the segmentation,

	HTTP/1.1 200 OK
	...
	ft-ab: aa:on,ratingsMetadata:off,follow:on
	...

Segment an anonymous user,

	curl -i localhost:5050/uk

... note that the response contains an allocation ID,

	HTTP/1.1 200 OK
	...
	ft-allocation-id: 393aced8-b04d-4b83-88fe-5e791add5d32
	...

Segment an anonymous user based on a previously used allocation ID,

	curl -i -H 'ft-allocation-id: 393aced8-b04d-...' localhost:5050/uk

Of course, the allocation id could be the Membership GUID if your system knows
this already.

## Creating an AB test 

As per usual, create a [feature
flag](http://github.com/Financial-Times/next-feature-flags-api), build your
feature.

Indicate the test is an AB test by setting the `abTestState` property to 'true', 

	{
		name: "streamHotTopics",
		safeState: false,
		expiry: new Date("2015-09-01T00:00:00.000Z"),
		state: false,
		abTestState: true,       <--- an AB test that is live
		tags: ["apps:dobi"],
		owner: 'chris.smith@ft.com'
	}

Release it. At this point your AB test will be running. All data Next collects
about a user will be tagged with the test name and variant the user belongs to.

Check the data is appearing in the real-time [beacon API](https://beacon.ft.com).

## Limitations and notes

The `state` flag should be turned _off_ (or false) for the duration of the
test. Segmentation works by flipping the flag _on_ for 50% of people, so having
the flag on by default will just mean everyone will see the same variant.
 
Segmentation is currently random. Users are split 50/50 in to a _control_ and a
single _variant._

Each AB test is coupled to a feature flag. If the flag expires or changes name
the AB test will become invalid. If you need to do that then just restart the
test.
