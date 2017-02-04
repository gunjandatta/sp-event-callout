import {List, Types} from "gd-sprest";

declare var CalloutManager:any;
declare var CalloutOptions:any;
declare var Promise:PromiseConstructorLike;
declare var SP:any;
declare var ExecuteOrDelayUntilScriptLoaded:any;

/**
 * SharePoint Calendar Event Callout Class
 */
class SPEventCallout {
    /**
     * Constructor
     */
    constructor(listName) {
        // Save the list name
        this._listName = listName;

        // Ensure the callout library is loaded
        SP.SOD.executeFunc("callout.js", "Callout", () => {
            // Wait for the calendar script to be loaded
            ExecuteOrDelayUntilScriptLoaded(() => {
                let _this_ = this;

                // Overload the onItemsSucceed event
                this._onItemsSucceed = SP.UI.ApplicationPages.CalendarStateHandler.prototype.onItemsSucceed;
                SP.UI.ApplicationPages.CalendarStateHandler.prototype.onItemsSucceed = function($p0, $p1) {
                    // Call the base
                    _this_._onItemsSucceed.call(this, $p0, $p1);

                    // Attach the callouts to the calendar events
                    _this_.attachCalloutsToEvents();
                };

                // Attach the callouts to the calendar events
                this.attachCalloutsToEvents();
            }, "SP.UI.ApplicationPages.Calendar.js");
        });
    }

    /**
     * Global Variables
     */

    // The callouts
    private _callouts:Array<any> = [];

    // The current item being displayed
    private _currentItemId:number = 0;

    // The fields to display in the callout
    private _fields:Array<string> = ["Category", "EventDate", "EndDate", "Location", "Description"];

    // The item Information
    private _items:Array<Types.IListItem> = [];

    // The original onItemsSucceed event
    private _onItemsSucceed = null;

    // List Name
    private _listName = "";

    /**
     * Methods
     */

    // Method to attach callouts to the events
    private attachCalloutsToEvents() {
        // Clear the callouts
        this._callouts = [];

        // Parse the calendar events
        let calEvents = <any>document.querySelectorAll(".ms-acal-item");
        for(let calEvent of calEvents) {
            // Add hover events
            calEvent.addEventListener("mouseover", this.hoverOverEvent);
            calEvent.addEventListener("mouseout", this.hoverOutEvent);

            // Get the item id for this event
            let link = calEvent.querySelector("a");
            let itemId = link ? link.href.substr(link.href.indexOf("ID=") + 3) : 0;

            // Create the callout options
            let calloutOptions = new CalloutOptions();
            calloutOptions.content = "<div>Loading the Event Information...</div>";
            calloutOptions.ID = itemId;
            calloutOptions.launchPoint = calEvent;
            calloutOptions.title = calEvent.title;

            // Remove the default hover text
            calEvent.removeAttribute("title");

            // Create the callout
            this._callouts[itemId] = CalloutManager.createNew(calloutOptions);
        }
    }

    // Method to get the item Information
    private getItemInfo(itemId) {
        // Return a promise
        return new Promise((resolve, reject) => {
            // See if we already queried for this item
            if(this._items[itemId]) {
                // Resolve the request
                resolve(this._items[itemId]);
            } else {
                // Get the list
                (new List(this._listName))
                    // Get the item
                    .Items(itemId)
                    // Execute the request
                    .execute((item) => {
                        // Save a reference to the item
                        this._items[itemId] = item;

                        // Resolve the promise
                        resolve(item);
                    });
            }
        });
    }

    // The hover out event
    private hoverOutEvent = () => {
        // Get the callout
        let callout = this._callouts[this._currentItemId];
        if(callout) {
            // Close the callout w/ animation
            callout.close(true);
        }

        // Clear the current item id
        this._currentItemId = 0;
    }

    // The hover over event
    private hoverOverEvent = (ev) => {
        // Get the item id for this event
        let link = ev.currentTarget.querySelector("a");
        let itemId = link ? link.href.substr(link.href.indexOf("ID=") + 3) : 0;
        if(itemId > 0 && itemId != this._currentItemId) {
            // Set the current item id
            this._currentItemId = itemId;

            // Get the callout
            let callout = this._callouts[this._currentItemId];

            // Get the item
            this.getItemInfo(this._currentItemId).then((item) => {
                let content = "";

                // Get the content element
                let elContent = callout.getContentElement().querySelector(".js-callout-body");

                // Parse the fields to display
                for(let field of this._fields) {
                    let title = field;
                    let value = item[field];

                    // See if this is a date/time field
                    if(field == "EndDate" || field == "EventDate") {
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

            // Open the callout
            callout.open();
        }
    }
};

// Make the class available globally
window["SPEventCallout"] = SPEventCallout;