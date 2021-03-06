// import _ from "lodash"

import {
  formatDate,
  formatDateMMMdd,
  formatTime,
  formatTimeArray,
  formatUTCDate,
  titleCase,
  formatHHMMampm,
} from "./shared/format"
import { companyLogo, miniCompanyLogo } from "./shared/imageSources"

// node imports
import compareVersions from "compare-versions"
import assert from "assert"

import "multiple-date-picker/dist/multipleDatePicker"

// Configuration Imports
import configureRoutes from "./router.js"

let app = angular.module("beeline", [
  "ionic",
  "ngCordova",
  "uiGmapgoogle-maps",
  "multipleDatePicker",
  "ngclipboard",
])

require("angular-simple-logger")
require("angular-google-maps")
require("clipboard")
require("ngclipboard")

// Directives
require("./directives/beelineBindHtml")
require("./directives/companyTnc/companyTnc")
require("./directives/countdown")
require("./directives/crowdstartShare")
require("./directives/dailyTripsBroker")
require("./directives/extA")
require("./directives/fakeProgressBar")
require("./directives/fancyPrice/fancyPrice")
require("./directives/inServiceWindow")
require("./directives/kickstartInfo/kickstartInfo")
require("./directives/mapBusIcon")
require("./directives/mapPolyRoute")
require("./directives/moreInfo/moreInfo")
require("./directives/myLocation")
require("./directives/poweredByBeeline/poweredByBeeline")
require("./directives/priceCalculator/priceCalculator")
require("./directives/progressBar/progressBar")
require("./directives/routeItem/animatedRoute")
require("./directives/routeItem/kickstartRoute")
require("./directives/routeItem/liteRoute")
require("./directives/routeItem/regularRoute")
require("./directives/routeItem/routeItem")
require("./directives/routeShare")
require("./directives/searchInput")
require("./directives/tripCode/tripCode")
require("./directives/ticketDetail/ticketDetail")
require("./directives/companyInfoBroker")
require("./directives/menuHamburger")

// Services
require("./services/BookingService")
require("./services/bookingSummaryModalService")
require("./services/CompanyService")
require("./services/CreditsService")
require("./services/fastCheckoutService")
require("./services/GeoUtils")
require("./services/GoogleAnalytics")
require("./services/KickstarterService")
require("./services/LazyLoadService")
require("./services/legalese")
require("./services/LiteRoutesService")
require("./services/LiteRouteSubscriptionService")
require("./services/LoadingSpinner")
require("./services/login")
require("./services/MapOptions")
require("./services/MapService")
require("./services/MapViewFactory")
require("./services/paymentService")
require("./services/purchaseRoutePassService")
require("./services/RotatedImageService")
require("./services/RoutesService")
require("./services/SearchService")
require("./services/ServerTimeService")
require("./services/SharedVariableService")
require("./services/StripeService")
require("./services/TicketService")
require("./services/TripService")
require("./services/UserService")
require("./services/PersonalRoutesService")
require("./services/OneMapPlaceService")

// //////////////////////////////////////////////////////////////////////////////
// Angular configuration
// //////////////////////////////////////////////////////////////////////////////
app
  .filter("formatDate", () => formatDate)
  .filter("formatDateMMMdd", () => formatDateMMMdd)
  .filter("formatUTCDate", () => formatUTCDate)
  .filter("formatTime", () => formatTime)
  .filter("formatTimeArray", () => formatTimeArray)
  .filter("formatHHMMampm", () => formatHHMMampm)
  .filter("titleCase", () => titleCase)
  .filter("routeStartTime", () => route =>
    route && route.trips ? route.trips[0].tripStops[0].time : ""
  )
  .filter("routeEndTime", () => route =>
    route && route.trips
      ? route.trips[0].tripStops[route.trips[0].tripStops.length - 1].time
      : ""
  )
  .filter("routeStartRoad", () => route =>
    route && route.trips ? route.trips[0].tripStops[0].stop.road : ""
  )
  .filter("routeEndRoad", () => route =>
    route && route.trips
      ? route.trips[0].tripStops[route.trips[0].tripStops.length - 1].stop.road
      : ""
  )
  .filter("companyLogo", () => companyLogo)
  .filter("miniCompanyLogo", () => miniCompanyLogo)
  .filter("monthNames", function() {
    return function(i) {
      let monthNames = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(
        ","
      )
      return monthNames[i]
    }
  })
  // round up a float number with optional precision
  .filter("floatRoundUp", function() {
    return function(number, precision) {
      if (!precision) precision = 2
      // 4.4 * (10 ^ 2) = 440.000000006
      // Math.ceil(440.000000006) = 441
      let temp = (number * Math.pow(10, precision)).toFixed(4)
      temp = Math.ceil(temp)
      return temp / Math.pow(10, precision)
    }
  })
  .controller(
    "IntroSlidesController",
    require("./controllers/IntroSlidesController.js").default
  )
  .controller(
    "RoutesListController",
    require("./controllers/RoutesListController.js").default
  )
  .controller(
    "RouteDetailController",
    require("./controllers/RouteDetailController.js").default
  )
  .controller(
    "RouteStopsController",
    require("./controllers/RouteStopsController.js").default
  )
  .controller(
    "BookingDatesController",
    require("./controllers/BookingDatesController.js").default
  )
  .controller(
    "BookingSummaryController",
    require("./controllers/BookingSummaryController.js").default
  )
  .controller(
    "BookingConfirmationController",
    require("./controllers/BookingConfirmationController.js").default
  )
  .controller(
    "SettingsController",
    require("./controllers/SettingsController.js").default
  )
  .controller(
    "TicketsController",
    require("./controllers/TicketsController.js").default
  )
  .controller(
    "TicketDetailController",
    require("./controllers/TicketDetailController.js").default
  )
  .controller(
    "BookingHistoryController",
    require("./controllers/BookingHistoryController.js").default
  )
  .controller(
    "LiteMoreInfoController",
    require("./controllers/LiteMoreInfoController.js").default
  )
  .controller(
    "WelcomeController",
    require("./controllers/WelcomeController.js").default
  )
  .controller(
    "KickstarterController",
    require("./controllers/KickstarterController.js").default
  )
  .controller(
    "KickstarterDetailController",
    require("./controllers/KickstarterDetailController.js").default
  )
  .controller(
    "KickstarterSummaryController",
    require("./controllers/KickstarterSummaryController.js").default
  )
  .controller(
    "KickstarterCommitController",
    require("./controllers/KickstarterCommitController.js").default
  )
  .controller(
    "KickstarterRecapController",
    require("./controllers/KickstarterRecapController.js").default
  )
  .controller(
    "TabsController",
    require("./controllers/TabsController.js").default
  )
  .controller(
    "MapViewController",
    require("./controllers/MapViewController.js").default
  )
  .controller(
    "RouteDetailMapViewController",
    require("./controllers/RouteDetailMapViewController.js").default
  )
  .controller(
    "LiteMapViewController",
    require("./controllers/LiteMapViewController.js").default
  )
  .controller(
    "TicketMapViewController",
    require("./controllers/TicketMapViewController.js").default
  )
  .controller(
    "LiteDetailController",
    require("./controllers/LiteDetailController.js").default
  )
  .controller(
    "KickstarterStopsController",
    require("./controllers/KickstarterStopsController.js").default
  )
  .config(configureRoutes)
  .config([
    "$locationProvider",
    function($locationProvider) {
      // XXX: Here be dragons
      // Turn on html5Mode only if we are sure we are not a cordova app
      // Further, Ionic breaks if the root document has a base tag, and we
      // cannot use html5Mode({enabled:true, requireBase: false}) as that
      // breaks all the routes in the app
      // Instead, _dynamically inject_ a base tag into the root document when
      // we realise that we are not cordova, to keep both sides happy
      if (!window.cordova) {
        const base = window.document.createElement("base")
        base.setAttribute("href", "/")
        const [head] = window.document.getElementsByTagName("head")
        head.appendChild(base)
        $locationProvider.html5Mode({ enabled: true })
      }
    },
  ])
  .config([
    "$ionicConfigProvider",
    function($ionicConfigProvider) {
      $ionicConfigProvider.tabs.position("bottom")
      $ionicConfigProvider.tabs.style("standard")
      $ionicConfigProvider.navBar.alignTitle("center")
      $ionicConfigProvider.scrolling.jsScrolling(false)
      // kickstart-summary use default history stack
      $ionicConfigProvider.backButton.previousTitleText(false).text(" ")
    },
  ])
  .config([
    "$httpProvider",
    function($httpProvider) {
      $httpProvider.useApplyAsync(true)
    },
  ])
  .config([
    "uiGmapGoogleMapApiProvider",
    function(uiGmapGoogleMapApiProvider) {
      if (process.env.GOOGLE_API_KEY) {
        uiGmapGoogleMapApiProvider.configure({
          key: process.env.GOOGLE_API_KEY,
          libraries: "places,geometry",
        })
      } else {
        uiGmapGoogleMapApiProvider.configure({
          client: "gme-infocommunications",
          libraries: "places,geometry",
        })
      }
    },
  ])
  .config([
    "$ionicConfigProvider",
    function($ionicConfigProvider) {
      $ionicConfigProvider.views.transition("none")
    },
  ])
  .run([
    "$ionicPlatform",
    function($ionicPlatform) {
      $ionicPlatform.ready(function() {
        if (typeof IonicDeeplink !== "undefined") {
          IonicDeeplink.route(
            {}, // No predetermined matches
            function(match) {},
            function(nomatch) {
              window.location.href =
                "#" + (nomatch.$link.fragment || nomatch.$link.path)
            }
          )
        }
      })
    },
  ])
  .run([
    "$rootScope",
    "replace",
    "p",
    function($rootScope, replace, p) {
      $rootScope.o = {
        ...p,
        replace,
      }
    },
  ])
  .run([
    "$ionicPlatform",
    function($ionicPlatform) {
      $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (
          window.cordova &&
          window.cordova.plugins &&
          window.cordova.plugins.Keyboard
        ) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false)
          cordova.plugins.Keyboard.disableScroll(false)
        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleLightContent()
        }
      })
    },
  ])
  .run([
    "$ionicPopup",
    function($ionicPopup) {
      // Check that external dependencies have loaded
      if (
        typeof StripeCheckout === "undefined" ||
        typeof Stripe === "undefined"
      ) {
        document.addEventListener("online", () => {
          window.location.reload(true)
        })

        $ionicPopup
          .alert({
            title: "Unable to connect to the Internet",
            template: `Please check your Internet connection`,
          })
          .then(() => {
            window.location.reload(true)
          })
      }
    },
  ])
  .run([
    "$rootScope",
    "$ionicTabsDelegate",
    function($rootScope, $ionicTabsDelegate) {
      // hide/show tabs bar depending on how the route is configured
      $rootScope.$on("$stateChangeSuccess", function(
        event,
        toState,
        toParams,
        fromState,
        fromParams
      ) {
        if (toState.data && toState.data.hideTabs) {
          $ionicTabsDelegate.showBar(false)
        } else {
          $ionicTabsDelegate.showBar(true)
        }
      })
    },
  ])
  .run([
    "RoutesService",
    "KickstarterService",
    "LiteRoutesService",
    "TicketService",
    function(
      RoutesService,
      KickstarterService,
      LiteRoutesService,
      TicketService
    ) {
      // Pre-fetch the routes
      RoutesService.fetchRoutes()
      RoutesService.fetchRecentRoutes()
      KickstarterService.fetchCrowdstart()
      KickstarterService.fetchBids()
      LiteRoutesService.fetchLiteRoutes()
      TicketService.fetchTickets()
    },
  ])
  .run([
    "$templateCache",
    function($templateCache) {
      $templateCache.put(
        "templates/intro-slides.html",
        require("../www/templates/intro-slides.html")
      )
      $templateCache.put(
        "templates/settings.html",
        require("../www/templates/settings.html")
      )
      $templateCache.put(
        "templates/routes-list.html",
        require("../www/templates/routes-list.html")
      )
      $templateCache.put(
        "templates/tickets.html",
        require("../www/templates/tickets.html")
      )
      $templateCache.put(
        "templates/ticket-detail.html",
        require("../www/templates/ticket-detail.html")
      )
      $templateCache.put(
        "templates/tab-booking-dates.html",
        require("../www/templates/tab-booking-dates.html")
      )
      $templateCache.put(
        "templates/tab-booking-summary.html",
        require("../www/templates/tab-booking-summary.html")
      )
      $templateCache.put(
        "templates/tab-booking-confirmation.html",
        require("../www/templates/tab-booking-confirmation.html")
      )
    },
  ])

let devicePromise = new Promise((resolve, reject) => {
  if (window.cordova) {
    document.addEventListener("deviceready", resolve, false)
  } else {
    console.warn("No cordova detected")
    resolve()
  }
})

app.service("DevicePromise", () => devicePromise)

app.run([
  "UserService",
  "$ionicPopup",
  async function(UserService, $ionicPopup) {
    // Version check, if we're in an app
    if (!window.cordova) {
      return
    }

    await devicePromise

    assert(window.cordova.InAppBrowser)
    assert(window.cordova.getAppVersion)
    assert(window.device)

    let versionNumberPromise = cordova.getAppVersion.getVersionNumber()

    let versionRequirementsPromise = UserService.beeline({
      method: "GET",
      url: "/versionRequirements",
    })

    let [versionNumber, versionRequirementsResponse] = await Promise.all([
      versionNumberPromise,
      versionRequirementsPromise,
    ])

    let appRequirements = versionRequirementsResponse.data.commuterApp
    assert(appRequirements)

    while (compareVersions(versionNumber, appRequirements.minVersion) < 0) {
      await $ionicPopup.alert({
        title: "Update required",
        template: `Your version of the app is too old. Please visit the app
      store to upgrade your app.`,
      })

      if (appRequirements.upgradeUrl) {
        cordova.InAppBrowser.open(
          appRequirements.upgradeUrl[device.platform],
          "_system"
        )
      }
    }
  },
])
