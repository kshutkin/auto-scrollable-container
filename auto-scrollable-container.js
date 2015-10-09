'use strict';

angular.module('auto-scrollable-container', [])
    .provider('ascConfig', function () {

        var defaults = {
                eventName: 'scrollContainer',
                scrollSpeed: 5
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
    .directive("ascContainer", ['$document', '$window', 'ascConfig', function($document, $window, ascConfig) {
        return function(scope, element) {
            scope.$on(ascConfig.eventName, function (event, eventObj) {
                event.stopPropagation();

                var targetY = eventObj.pageY - ($window.pageYOffset || $document[0].documentElement.scrollTop);
                if (targetY < element.top) {
                    element.scrollTop = element.scrollTop - ascConfig.scrollSpeed;
                } else if (targetY > element.bottom) {
                    element.scrollTop = element.scrollTop + ascConfig.scrollSpeed;
                }
            });
        };
    }]);
