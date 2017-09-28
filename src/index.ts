import { List, Types } from "gd-sprest";

declare var CalloutManager: any;
declare var CalloutOptions: any;
declare var Promise: PromiseConstructorLike;
declare var SP: any;
declare var ExecuteOrDelayUntilScriptLoaded: any;

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

        // Ensure the SP library is loaded
        SP.SOD.loadMultiple(["callout.js", "sp.ui.dialog.js"], () => {
            // Wait for the calendar script to be loaded
            ExecuteOrDelayUntilScriptLoaded(() => {
                let _this_ = this;

                // Overload the onItemsSucceed event
                this._onItemsSucceed = SP.UI.ApplicationPages.CalendarStateHandler.prototype.onItemsSucceed;
                SP.UI.ApplicationPages.CalendarStateHandler.prototype.onItemsSucceed = function ($p0, $p1) {
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
    private _callouts: Array<any> = [];

    // The current item being displayed
    private _currentItemId: number = 0;

    // The fields to display in the callout
    private _fields: Array<string> = ["Category", "EventDate", "EndDate", "Location", "Description"];

    // The item Information
    private _items: Array<Types.IListItem> = [];

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
        for (let i = 0; i < calEvents.length; i++) {
            let calEvent = calEvents[i];

            // Get the item id for this event
            let link = calEvent.querySelector("a");
            let itemId = link ? link.href.substr(link.href.indexOf("ID=") + 3) : 0;
            if (itemId > 0) {
                // Remove the default hover text
                calEvent.removeAttribute("title");

                // Get the callout
                let callout = CalloutManager.getFromLaunchPointIfExists(calEvent) as HTMLDivElement;
                if (callout == null) {
                    // Create the callout
                    callout = CalloutManager.createNewIfNecessary({
                        beakOrientation: "leftRight",
                        content: "<div>Loading the Event Information...</div>",
                        ID: i + "_" + itemId,
                        launchPoint: calEvent,
                        openOptions: { event: "hover", showCloseButton: true },
                        title: calEvent.title,
                        onOpeningCallback: (callout) => {
                            // Get the item id
                            let itemId = callout.getID().split("_")[1];

                            // Render the item
                            this.renderCalloutContent(callout, itemId);
                        }
                    });
                }
            }
        }
    }

    // Method to get the item Information
    private getItemInfo(itemId) {
        // Return a promise
        return new Promise((resolve, reject) => {
            // See if we already queried for this item
            if (this._items[itemId]) {
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

    // Method to render the callout content
    renderCalloutContent = (callout, itemId) => {
        // Get the item
        this.getItemInfo(itemId).then((item) => {
            let content = "";

            // Get the content element
            let elContent = callout.getContentElement().querySelector(".js-callout-body");

            // Parse the fields to display
            for (let i = 0; i < this._fields.length; i++) {
                let field = this._fields[i];
                let title = field;
                let value = item[field];

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
    }
};

// Make the class available globally
window["SPEventCallout"] = SPEventCallout;