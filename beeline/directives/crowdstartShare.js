angular.module("beeline").directive("crowdstartShare", [
  "$rootScope",
  "$cordovaSocialSharing",
  function($rootScope, $cordovaSocialSharing) {
    return {
      replace: true,
      restrict: "E",
      template: `<div class="item item-text-wrap">
                  <div class="share-box">
                    Share this campaign to your friends and colleagues to increase the chance of activating this route!
                    <div class="text-center">
                      <textarea rows="4">{{shareLink}}</textarea>
                    </div>
                    <div class="text-right">
                      <button class="button button-outline button-royal small-button" ng-click="shareAnywhere()" ng-if="!showCopy">Share</button>
                      <button class="button button-outline button-royal small-button" ng-if="showCopy" ngclipboard data-clipboard-text={{shareLink}}>
                          Copy
                      </button>
                    </div>
                  </div>
                </div>`,
      scope: {
        routeId: "<",
      },
      link: function(scope, element, attributes) {
        scope.showCopy = !window.cordova || false
        // if has cordova no need to show shareLink text area
        const domain =
          $rootScope.o.APP.NAME === "GrabShuttle"
            ? "https://grabshuttle.beeline.sg"
            : "https://app.beeline.sg"
        scope.shareLink = `Hey, check out this new crowdstart route from ${
          $rootScope.o.APP.NAME
        }! ${domain}/tabs/crowdstart/${scope.routeId}/detail`

        scope.shareAnywhere = function() {
          $cordovaSocialSharing.share(scope.shareLink)
        }
      },
    }
  },
])
