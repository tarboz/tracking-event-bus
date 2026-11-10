'use strict';

import { emitEvent as trackEvent, events } from 'trackingEventBus.js';

trackEvent(events.click, { pname1: 'pval1', pname2: 'pval2' });

window.addEventListener('some-event', ({ detail } = {}) => {
    trackEvent(events.click, { pname1: 'pval1', pname2: 'pval2', evtData: detail });
});
