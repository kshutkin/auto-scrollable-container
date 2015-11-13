'use strict';

angular.module('auto-scrollable-container', [])
    .provider('ascConfig', function () {

        var defaults = {
                eventName: 'scrollContainer',
                broadcastEventName: 'scrollContainerBroadcast',
                scrollSpeed: 20,
                timeout: 100
            },
            userOptions = {};

        return {
            setOptions : function (options) {
                angular.extend(userOptions, options);
            },
            $get: function () {
                return angular.extend({}, defaults, userOptions);
            }
        };
    })
    .factory("ascHandlerFactory", ['ascConfig', function(ascConfig) {
        return {
            createDragMoveHandler : function(scope) {
                return function (itemPosition, containment, eventObj) {
                    if (eventObj) {
                        scope.$emit(ascConfig.eventName, eventObj);
                    }
                };
            },
            createBroadcastDragMoveHandler : function(scope) {
                return function (itemPosition, containment, eventObj) {
                    if (eventObj) {
                        scope.$broadcast(ascConfig.broadcastEventName, eventObj);
                    }
                };
            }
        };
    }])
    .directive("ascMessageRelay", ['ascConfig', function(ascConfig) {
        return {
            controller: ['$scope', function($scope) {
                $scope.$on(ascConfig.eventName, function (event, eventObj) {
                    event.stopPropagation();

                    $scope.$broadcast(ascConfig.broadcastEventName, eventObj);
                });
            }]
        };
    }])
    .directive("ascContainer", ['$document', '$window', '$timeout', 'ascConfig', function($document, $window, $timeout, ascConfig) {
        return {
            link: function(scope, element) {

                var mouseY;

                scope.$on(ascConfig.eventName, function (event, eventObj) {
                    event.stopPropagation();

                    handleDragMove(eventObj);
                });

                scope.$on(ascConfig.broadcastEventName, function (event, eventObj) {
                    handleDragMove(eventObj);
                });

                $document.on('mousemove', storePosition);

                scope.$on('$destroy', function() {
                    $document.off('mousemove', storePosition);
                });

                function handleDragMove(eventObj) {
                    var targetY = eventObj.pageY - ($window.pageYOffset || $document[0].documentElement.scrollTop);

                    scrollIfNeeded(targetY);
                }

                function storePosition(event) {
                    mouseY = event.clientY;
                }

                function checkPosition() {
                    scrollIfNeeded(mouseY);
                }

                function scrollIfNeeded(targetY) {
                    var top = element[0].clientTop, container = element[0].getBoundingClientRect();
                    if (targetY < container.top) {
                        element[0].scrollTop = element[0].scrollTop - ascConfig.scrollSpeed;

                        $timeout(checkPosition, ascConfig.timeout);
                    } else if (targetY > container.bottom) {
                        element[0].scrollTop = element[0].scrollTop + ascConfig.scrollSpeed;

                        $timeout(checkPosition, ascConfig.timeout);
                    }
                }
            }
        };
    }]);
