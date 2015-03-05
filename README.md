# next-ab

This application is a simple API for segmenting users in to AB test buckets. 

## Usage 

Usual Next rules apply - `make clean`, `make install`, `make run`, `make test`, ...

## Creating an AB test 

- As per usual, create a [feature
  flag](http://github.com/Financial-Times/next-feature-flags-api), build
  your feature, and release it.
- Add the flag to the [current AB test list](models/tests.js), and release
  this. At this point your AB test will be running. All data Next collects
  about a user will be tagged with the test name and variant the user belongs
  to.
- Check the data is appearing in the real-time beacon API.

You can then export the data and analyse it. 

## Limitations and notes

- The flag should be turned _off_ for the duration of the test.
- Segmentation is currently random. Users are split 50/50 in to a _control_ and
  a single _variant._
- Each AB test is coupled to a feature flag. If the flag expires or changes name the AB
  test will become invalid. If you need to do that then just restart the test.

## To-do

- Segmenting traffic this way means we couple the incoming http request to a
  uncachable response.
- Segmentation is basic at the moment. Segemntation by geography, pre-selected
  groups of users etc. can all be added quite simply.
- We only segment users with eRights ID's. Over time we'll need to add a
  concept of a unregistered user. 
