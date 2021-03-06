import assert from "assert"

angular.module("beeline").factory("TripService", [
  "UserService",
  function TripService(UserService) {
    return {
      getTripData: function(id) {
        assert(typeof id === "number")
        return UserService.beeline({
          method: "GET",
          url: "/trips/" + id,
        }).then(function(response) {
          return response.data
        })
      },

      driverPings: function(id) {
        assert(typeof id === "number")
        return UserService.tracking({
          method: "GET",
          url: `/trips/${id}/pings?limit=20`,
          timeout: 10000,
        }).then(function(response) {
          for (let ping of response.data) {
            ping.time = new Date(ping.time)
          }
          return response.data
        })
      },

      latestInfo: function(id) {
        assert(typeof id === "number")
        return UserService.beeline({
          method: "GET",
          url: `/trips/${id}/latest_info`,
          timeout: 10000,
        }).then(response => response.data)
      },

      statuses: function(id) {
        assert(typeof id === "number")
        return UserService.beeline({
          method: "GET",
          url: `/trips/${id}/statuses?limit=5`,
          timeout: 10000,
        }).then(response => response.data)
      },
    }
  },
])
