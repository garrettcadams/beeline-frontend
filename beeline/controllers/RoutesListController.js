import _ from 'lodash';

export default function(
  // Angular Tools
  $scope,
  $q,
  // Route Information
  RoutesService,
  KickstarterService,
  LiteRoutesService,
  // Misc
  LiteRouteSubscriptionService,
  SearchService,
  BookingService,
  uiGmapGoogleMapApi,
  LazyLoadService
) {

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  // Explicitly declare/initialize of scope variables we use
  $scope.data = {
    placeQuery: null, // The place object used to search
    searchBoxText: "", // The actual text in the box used only for the clear button
    // Different types of route data
    activatedCrowdstartRoutes: [],
    recentRoutes: [],
    recentRoutesById: null,
    liteRoutes: [],
    routes: [],
    crowdstartRoutes: [],
    nextSessionId: null,
    isFiltering: null,
    routesYouMayLike: []
  };


  uiGmapGoogleMapApi.then((googleMaps) => {
    // Initialize it with google autocompleteService and PlacesService
    let searchBox = document.getElementById('search');
    // Blur on enter
    searchBox.addEventListener("keypress", function(event) {
      if (event.key === "Enter") this.blur();
    });

    $scope.autocompleteService = LazyLoadService(() => new googleMaps.places.AutocompleteService());
    $scope.placesService = LazyLoadService(() => new google.maps.places.PlacesService(searchBox))
  });

  function newSearch () {
    if (!$scope.data.searchBoxText) {
      return
    }
    $scope.data.isFiltering = true
    $scope.$digest()

    // Perform initial update of routes using text filter
    $scope.data.placeQuery = null
    updateRoutes()

    // Check if we need to make place query
    let minNumRoutes = 3
    let performPlaceQuery = ($scope.data.routes.length 
                            +$scope.data.crowdstartRoutes.length) < minNumRoutes

    if (performPlaceQuery) {
      // Note: getPlace() will handle setting $scope.data.isFiltering and 
      // calling $scope.digest()
      getPlace()
    } else {
      $scope.data.isFiltering = false
      $scope.$digest()
    }
  }

  function updateRoutes () {
    updateNormalRoutes(RoutesService.getRoutesWithRoutePass())
    updateRecentRoutes(RoutesService.getRecentRoutes(),
                       RoutesService.getRoutesWithRoutePass())
    updateLiteRoutes(LiteRoutesService.getLiteRoutes(),
                     LiteRouteSubscriptionService.getSubscriptionSummary())
    updateActivatedKickstarterRoutes(RoutesService.getActivatedKickstarterRoutes())
    updateBackedKickstarterRoutes(KickstarterService.getCrowdstart(),
                                  KickstarterService.getBids())
    updateUnactivatedKickstarterRoutes(KickstarterService.getCrowdstart(),
                                       KickstarterService.getBids())
  }

  function getPlace () {
    if (!$scope.data.searchBoxText || !$scope.autocompleteService) {
      return
    }

    // if has predicted place assign the 1st prediction to place object
    $scope.autocompleteService().getPlacePredictions({
      componentRestrictions: {country: 'SG'},
      input: $scope.data.searchBoxText
    }, predictions => {
      // If no results found then we can't do place query so just return null
      if (!predictions || predictions.length === 0) {
        return
      }

      // Apply the details as the full result
      $scope.placesService().getDetails({
        placeId: predictions[0].place_id
      }, result => {
        $scope.data.placeQuery = result
        updateRoutes()
        $scope.data.isFiltering = false
        $scope.$digest()
      });
    })
  }

  function updateNormalRoutes (allRoutes) {
    allRoutes = allRoutes ? allRoutes : []
    
    // Filter the routes
    if ($scope.data.placeQuery) {
      allRoutes = SearchService.filterRoutesByPlaceAndText(
        allRoutes, $scope.data.placeQuery, $scope.data.searchBoxText)
    } else {
      allRoutes = SearchService.filterRoutesByText(allRoutes, $scope.data.searchBoxText)
    }

    // Sort the routes by the time of day
    $scope.data.routes = _.sortBy(allRoutes, 'label', route => {
      var firstTripStop = _.get(route, 'trips[0].tripStops[0]')
      var midnightOfTrip = new Date(firstTripStop.time.getTime())
      midnightOfTrip.setHours(0, 0, 0, 0)
      return firstTripStop.time.getTime() - midnightOfTrip.getTime()
    })
  }

  function updateRecentRoutes (recentRoutes, allRoutes) {
    recentRoutes = recentRoutes ? recentRoutes : []
    allRoutes = allRoutes ? allRoutes : []
    let textFilteredAllRoutes = SearchService.filterRoutesByText(allRoutes, $scope.data.searchBoxText)

    // "Fill in" the recent routes with the all routes data
    let allRoutesById = _.keyBy(textFilteredAllRoutes, 'id');

    $scope.data.recentRoutes = recentRoutes.map(recentRoute => {
      return _.assign({
        alightStopStopId: recentRoute.alightStopStopId,
        boardStopStopId: recentRoute.boardStopStopId
      }, allRoutesById[recentRoute.id]);
    // Clean out "junk" routes which may be old/obsolete
    }).filter(route => route && route.id !== undefined)

    $scope.data.recentRoutesById = _.keyBy($scope.data.recentRoutes, 'id')
  }

  function updateLiteRoutes (liteRoutes, subscribed) {
    liteRoutes = liteRoutes ? liteRoutes : []
    liteRoutes = Object.values(liteRoutes)
    
    // Filter the routes
    if ($scope.data.placeQuery) {
      liteRoutes = SearchService.filterRoutesByPlaceAndText(
        liteRoutes, $scope.data.placeQuery, $scope.data.searchBoxText)
    } else {
      liteRoutes = SearchService.filterRoutesByText(
        liteRoutes, $scope.data.searchBoxText)
    }

    // Add the subscription information
    _.forEach(liteRoutes, liteRoute => {
      liteRoute.isSubscribed = !!subscribed.includes(liteRoute.label);
    })

    // Sort by label and publish
    $scope.data.liteRoutes = _.sortBy(liteRoutes, route => {
      return parseInt(route.label.slice(1));
    });
  }

  function updateActivatedKickstarterRoutes (kickstartedRoutes) {
    kickstartedRoutes = kickstartedRoutes ? kickstartedRoutes : []
    if ($scope.data.placeQuery) {
      $scope.data.activatedCrowdstartRoutes = SearchService.filterRoutesByPlaceAndText(
        kickstartedRoutes, $scope.data.placeQuery, $scope.data.searchBoxText)
    } else {
      $scope.data.activatedCrowdstartRoutes = SearchService.filterRoutesByText(
        kickstartedRoutes, $scope.data.searchBoxText)
    }
  }

  function updateBackedKickstarterRoutes (routes, bids) {
    routes = routes ? routes : []
    bids = bids ? bids : []

    // Filter to the routes the user bidded on
    let biddedRouteIds = bids.map(bid => bid.routeId);
    routes = routes.filter(route => {
      return biddedRouteIds.includes(route.id.toString());
    });

    // don't display it in backed list if the pass expires after 1 month of 1st trip
    //and don't display it if it's 7 days after expired and not actived
    routes = routes.filter((route)=>(!route.passExpired && route.isActived)
                                      || !route.isExpired || !route.is7DaysOld);

    // Filter the routes
    if ($scope.data.placeQuery) {
      routes = SearchService.filterRoutesByPlaceAndText(
        routes, $scope.data.placeQuery, $scope.data.searchBoxText)
    } else {
      routes = SearchService.filterRoutesByText(
        routes, $scope.data.searchBoxText)
    }

    // Map to scope once done filtering and sorting
    $scope.data.biddedCrowdstartRoutes = _.sortBy(routes, route => {
      return parseInt(route.label.slice(1));
    });
  }

  function updateUnactivatedKickstarterRoutes (routes, bids) {
    routes = routes ? routes : []
    bids = bids ? bids : []
    // Filter out the routes the user bidded on
    // These are already shown elsewhere
    let biddedRouteIds = bids.map(bid => bid.routeId);
    routes = routes.filter(route => {
      return !biddedRouteIds.includes(route.id.toString());
    });
    // Filter out the expired routes
    routes = routes.filter(route => !route.isExpired);

    // Filter the routes
    if ($scope.data.placeQuery) {
      routes = SearchService.filterRoutesByPlaceAndText(
        routes, $scope.data.placeQuery, $scope.data.searchBoxText)
    } else {
    routes = SearchService.filterRoutesByText(
      routes, $scope.data.searchBoxText)
    }

    // Map to scope once done filtering and sorting
    $scope.data.crowdstartRoutes = _.sortBy(routes, route => {
      return parseInt(route.label.slice(1));
    });

  }
  // ---------------------------------------------------------------------------
  // UI Hooks
  // ---------------------------------------------------------------------------

  $scope.$watch('data.searchBoxText',
    _.debounce(newSearch, 1000, {leading: false, trailing: true})
  )

  // Manually pull the newest data from the server
  // Report any errors that happen
  // Note that theres no need to update the scope manually
  // since this is done by the service watchers
  $scope.refreshRoutes = function (ignoreCache) {
    RoutesService.fetchRoutePasses(ignoreCache);
    RoutesService.fetchRoutes(ignoreCache);
    var routesPromise = RoutesService.fetchRoutesWithRoutePass();
    var recentRoutesPromise = RoutesService.fetchRecentRoutes(ignoreCache);
    var allLiteRoutesPromise = LiteRoutesService.fetchLiteRoutes(ignoreCache);
    var crowdstartRoutesPromise = KickstarterService.fetchCrowdstart(ignoreCache);
    var liteRouteSubscriptionsPromise = LiteRouteSubscriptionService.getSubscriptions(ignoreCache);
    return $q.all([
      routesPromise,
      recentRoutesPromise,
      allLiteRoutesPromise,
      liteRouteSubscriptionsPromise,
      crowdstartRoutesPromise
    ]).then(() => {
      $scope.error = null;
    }).catch(() => {
      $scope.error = true;
    }).then(() => {
      $scope.$broadcast('scroll.refreshComplete');
    })
  };

  $scope.$watch("data.searchBoxText", (searchBoxText) => {
    if (searchBoxText.length === 0) $scope.data.placeQuery = null;
  });

  // ---------------------------------------------------------------------------
  // Model Hooks
  // ---------------------------------------------------------------------------
  // Kickstarted routes
  $scope.$watchGroup(
    [() => RoutesService.getActivatedKickstarterRoutes()],
    ([routes]) => {
      // Input validation
      if (!routes) routes = [];
      updateActivatedKickstarterRoutes(routes)
    }
  );

  // Recent routes
  // Need to pull in the "full" data from all routes
  $scope.$watchGroup(
    [
      () => RoutesService.getRecentRoutes(),
      () => RoutesService.getRoutesWithRoutePass(),
    ],
    ([recentRoutes, allRoutes]) => {
      // If we cant find route data here then proceed with empty
      // This allows it to organically "clear" any state
      if (!recentRoutes) recentRoutes = [];
      if (!allRoutes) allRoutes = [];

      updateRecentRoutes(recentRoutes, allRoutes)
    }
  );

  // blend activatedCrowdstartRoutes and recentRoutes
  $scope.$watchGroup(
    ['data.activatedCrowdstartRoutes', 'data.recentRoutesById'],
    ([activatedCrowdstartRoutes, recentRoutesById]) => {
      if (activatedCrowdstartRoutes && recentRoutesById) {
        let activatedCrowdstartRoutesIds = _.map(activatedCrowdstartRoutes, route => route.id);
        $scope.data.recentRoutes = $scope.data.recentRoutes.filter (
          (route) => !activatedCrowdstartRoutesIds.includes(route.id)
        );
      }
    }
  );

  // pull interested routes based on recently booking
  // assumption on 'AM from' and 'PM to' stop as 'home place / target place'
  // search based on target with radius of 500m
  // reset to null if user use search bar
  $scope.$watchGroup(
    ['data.recentRoutesById', 'data.routes'],
    ([recentRoutesById, routes]) => {
      if (recentRoutesById && routes) {
        let placeResults = [];
        let stop = null
        for (let id in recentRoutesById) {
          let route = recentRoutesById[id]
          let lnglat = null
          let tripStopsByKey = _.keyBy(route.trips[0].tripStops, (stop)=>stop.stopId)
          if (route.schedule && route.schedule.slice(0,2) === 'AM') {
            lnglat = tripStopsByKey[route.boardStopStopId].stop.coordinates.coordinates
          } else {
            lnglat = tripStopsByKey[route.alightStopStopId].stop.coordinates.coordinates
          }
          let results = SearchService.filterRoutesByLngLat($scope.data.routes, lnglat);
          placeResults = _.concat(placeResults, results)
        }
        // filter recently booked route ids
        _.remove(placeResults, (x)=>{
          return recentRoutesById[x.id]
        })
        // publish unique routes
        $scope.data.routesYouMayLike = _.uniqBy(placeResults, 'id')
      }
    }
  )

  // Backed kickstarter routes
  $scope.$watchGroup(
    [
      () => KickstarterService.getCrowdstart(),
      () => KickstarterService.getBids(),
    ],
    ([routes, bids]) => {
      if (!routes) routes = [];
      if (!bids) bids = [];
      updateBackedKickstarterRoutes(routes, bids)
    }
  );

  // Lite routes
  $scope.$watchGroup(
    [
      () => LiteRoutesService.getLiteRoutes(),
      () => LiteRouteSubscriptionService.getSubscriptionSummary(),
    ],
    ([liteRoutes, subscribed]) =>{
      // Input validation
      if (!liteRoutes) liteRoutes = [];
      updateLiteRoutes(liteRoutes, subscribed)
    }
  )

  // Normal routes
  // Sort them by start time
  $scope.$watchGroup(
    [() => RoutesService.getRoutesWithRoutePass()],
    ([normalRoutes]) => {
      // Input validation
      if (!normalRoutes) normalRoutes = []
      updateNormalRoutes(normalRoutes)
    }
  );

  // Unactivated kickstarter routes
  $scope.$watchGroup(
    [
      () => KickstarterService.getCrowdstart(),
      () => KickstarterService.getBids(),
    ],
    ([routes, bids]) => {
      if (!routes) routes = [];
      if (!bids) bids = [];
      updateUnactivatedKickstarterRoutes(routes, bids)
    }
  );

  // ---------------------------------------------------------------------------
  // Misc
  // ---------------------------------------------------------------------------

  // Session ID cache for some reason?
  // let ionic to clear page cache if user goes through booking process of the
  // same route few times, always start with clean form (pre-chosen stops etc.
  // are cleared),this is the internal mechanism of ionic (as any part of query
  // string change, the cache are cleared)
  $scope.$on('$ionicView.beforeEnter', () => {
    $scope.data.nextSessionId = BookingService.newSession();
  })

}
