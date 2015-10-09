'use strict';

angular.module('auto-scrollable-container', [])
    .provider('ascConfig', function () {

        var defaults = {
                eventName: 'scrollContainer',
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
        }
    })
    .factory("ascHandlerFactory", ['ascConfig', function(ascConfig) {
        return {
            createDragMoveHandler : function(scope) {
                return function (itemPosition, containment, eventObj) {
                    if (eventObj) {
                        scope.$emit(ascConfig.eventName, eventObj);
                    }
                }
            }
        };
    }])
    .directive("ascContainer", ['$document', '$window', '$timeout', 'ascConfig', function($document, $window, $timeout, ascConfig) {
        return function(scope, element) {

            var mouseY;

            scope.$on(ascConfig.eventName, function (event, eventObj) {
                event.stopPropagation();

                var targetY = eventObj.pageY - ($window.pageYOffset || $document[0].documentElement.scrollTop);

                scrollIfNeeded(targetY);
            });


            $document.on('mousemove', storePosition);

            scope.$on('$destroy', function() {
                $document.off('mousemove', storePosition);
            });

            function storePosition(event) {
                mouseY = event.pageY
            }

            function checkPosition() {
                scrollIfNeeded(mouseY);
            }

            function scrollIfNeeded(targetY) {
                var container = element[0].getBoundingClientRect();
                if (targetY < container.top) {
                    element[0].scrollTop = element[0].scrollTop - ascConfig.scrollSpeed;

                    $timeout(checkPosition, ascConfig.timeout);
                } else if (targetY > container.bottom) {
                    element[0].scrollTop = element[0].scrollTop + ascConfig.scrollSpeed;

                    $timeout(checkPosition, ascConfig.timeout);
                }
            }
        };
    }]);
