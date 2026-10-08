# Recovery context transition and independent audit server

The 485-record browser run exposed an intermittent WebKit check-in interaction.
The unavailable-workout label could appear before the asynchronous workspace
refresh finished. A later success-message insertion above the form shifted the
page during the removal click: the retained failing trace shows scroll position
1031 before/action and 1071 after, with the status paragraph inserted after the
action snapshot. The link remained selected and storage correctly rejected it.

The optional workout-context fieldset now stays disabled and marks itself busy
until the workspace operation completes. Loading, link selection and link removal
therefore resume in the same render as the completion message. Other unsaved form
values are preserved. Existing completed-workout validation is unchanged.

A component regression holds the refresh promise open, verifies disabled removal
does not change the selected link, then resolves the refresh and verifies removal
and the submitted identity/version. The browser regression additionally verifies
the removed link stays absent after saving and reloading. Diagnostic pointer
logging was temporary and is absent from the application and committed tests.

The route audit also owns port 3100 independently of the production browser
suite's port 3000. Reusing another suite's managed server caused connection
failures when its owner exited; those failure logs are retained locally. The
independent-port check passed while the browser suite continued. Existing server
timeouts, assertions, security headers and performance budgets are unchanged.

The earlier 667-route success is scoped to its recorded build date. A rebuilt
application requires fresh evidence; reports must not relabel old measurements.
