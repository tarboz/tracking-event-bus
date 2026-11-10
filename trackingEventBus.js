'use strict';

const EVENTS = {
    TrackingEvent: 'TrackingEvent',
    click: 'click'
};

const EVENT_BUS_ALLOWED_IDLE = 200; //ms

/**
 * @description Listens for events emitted for tracking and pushes to dataLayer one after another
 */
function initTrackingEventBus() {
    if (!window.trackingEventBus) return;
    var queue = [];

    var enqueueEvent = (eventData) => {
        if (queue.length === 0) dequeueEvent(eventData); //Call to start event processing
        else queue.push(eventData); //Add to queue to be processed after previous event finished
    };

    var dequeueEvent = (enqueuedEventData) => {
        let eventData = enqueuedEventData || queue.shift();
        if (!eventData) return;
        requestIdleCallback(
            () => {
                Promise
                    .resolve(eventData)
                    .then((eventData) => window.dataLayer.push(eventData))
                    .catch(console.error)
                    .finally(dequeueEvent); //Process events from queue if any left
            },
            { timeout: EVENT_BUS_ALLOWED_IDLE }
        );
    };

    window.trackingEventBus.addEventListener(EVENTS.TrackingEvent, ({ detail: eventData = {} }) => {
        enqueueEvent(eventData);
    });
}

/**
 * @description Sends event to event bus
 * @param {string} event event name
 * @param {Object} data data object
 */
function emitEvent(event, data = {}) {
    if (!window.trackingEventBus) return;
    if (event) data.event = event;
    let trackingEvent = new CustomEvent(EVENTS.TrackingEvent, { detail: data });
    window.trackingEventBus.dispatchEvent(trackingEvent);
}

/**
 * @description Initialize the bus
 */
function init() {
    window.dataLayer = window.dataLayer || [];
    initTrackingEventBus();
}

export { init, emitEvent, EVENTS as events };
