import React from "react";

export function GetNotifications({getNotification}) {
    getNotification()
    return (
        <div>
            <h4>Notifications List</h4>
            <div id="notifications-list"></div>
        </div>
    );
}
