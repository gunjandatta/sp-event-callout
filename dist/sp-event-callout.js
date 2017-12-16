"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("core-js/es6/promise");
var gd_sprest_1 = require("gd-sprest");
/**
 * SharePoint Calendar Event Callout Class
 */
var SPEventCallout = /** @class */ (function () {
    /**
     * Constructor
     */
    function SPEventCallout(listName) {
        var _this = this;
        /**
         * Global Variables
         */
        // The callouts
        this._callouts = [];
        // The current item being displayed
        this._currentItemId = 0;
        // The fields to display in the callout
        this._fields = ["Category", "EventDate", "EndDate", "Location", "Description"];
        // The item Information
        this._items = [];
        // The original onItemsSucceed event
        this._onItemsSucceed = null;
        // List Name
        this._listName = "";
        // Method to render the callout content
        this.renderCalloutContent = function (callout, itemId) {
            // Get the item
            _this.getItemInfo(itemId).then(function (item) {
                var content = "";
                // Get the content element
                var elContent = callout.getContentElement().querySelector(".js-callout-body");
                // Parse the fields to display
                for (var i = 0; i < _this._fields.length; i++) {
                    var field = _this._fields[i];
                    var title = field;
                    var value = item[field];
                    // See if this is a date/time field
                    if (field == "EndDate" || field == "EventDate") {
                        // Convert the date field
                        value = (new Date(value)).toString();
                        // Set the title
                        title = field == "EndDate" ? "End Date" : "Start Date";
                    }
                    // Update the content
                    content += "<div><strong>" + title + ": </strong>" + value + "</div>";
                }
                // Update the content element
                elContent.innerHTML = content;
            });
        };
        // Save the list name
        this._listName = listName;
        // Ensure the SP library is loaded
        SP.SOD.loadMultiple(["callout.js", "sp.ui.dialog.js"], function () {
            // Wait for the calendar script to be loaded
            ExecuteOrDelayUntilScriptLoaded(function () {
                var _this_ = _this;
                // Overload the onItemsSucceed event
                _this._onItemsSucceed = SP.UI.ApplicationPages.CalendarStateHandler.prototype.onItemsSucceed;
                SP.UI.ApplicationPages.CalendarStateHandler.prototype.onItemsSucceed = function ($p0, $p1) {
                    // Call the base
                    _this_._onItemsSucceed.call(this, $p0, $p1);
                    // Attach the callouts to the calendar events
                    _this_.attachCalloutsToEvents();
                };
                // Attach the callouts to the calendar events
                _this.attachCalloutsToEvents();
            }, "SP.UI.ApplicationPages.Calendar.js");
        });
    }
    /**
     * Methods
     */
    // Method to attach callouts to the events
    SPEventCallout.prototype.attachCalloutsToEvents = function () {
        var _this = this;
        // Clear the callouts
        this._callouts = [];
        // Parse the calendar events
        var calEvents = document.querySelectorAll(".ms-acal-item");
        for (var i = 0; i < calEvents.length; i++) {
            var calEvent = calEvents[i];
            // Get the item id for this event
            var link = calEvent.querySelector("a");
            var itemId = link ? link.href.substr(link.href.indexOf("ID=") + 3) : 0;
            if (itemId > 0) {
                // Remove the default hover text
                calEvent.removeAttribute("title");
                // Get the callout
                var callout = CalloutManager.getFromLaunchPointIfExists(calEvent);
                if (callout == null) {
                    // Create the callout
                    callout = CalloutManager.createNewIfNecessary({
                        beakOrientation: "leftRight",
                        content: "<div>Loading the Event Information...</div>",
                        ID: i + "_" + itemId,
                        launchPoint: calEvent,
                        openOptions: { event: "hover", showCloseButton: true },
                        title: calEvent.title,
                        onOpeningCallback: function (callout) {
                            // Get the item id
                            var itemId = callout.getID().split("_")[1];
                            // Render the item
                            _this.renderCalloutContent(callout, itemId);
                        }
                    });
                }
            }
        }
    };
    // Method to get the item Information
    SPEventCallout.prototype.getItemInfo = function (itemId) {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // See if we already queried for this item
            if (_this._items[itemId]) {
                // Resolve the request
                resolve(_this._items[itemId]);
            }
            else {
                // Get the list
                (new gd_sprest_1.List(_this._listName))
                    .Items(itemId)
                    .execute(function (item) {
                    // Save a reference to the item
                    _this._items[itemId] = item;
                    // Resolve the promise
                    resolve(item);
                });
            }
        });
    };
    return SPEventCallout;
}());
;
// Make the class available globally
window["SPEventCallout"] = SPEventCallout;
