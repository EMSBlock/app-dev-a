import React from "react";

export function GetNotifications({ getNotification, tokenSymbol }) {
    //var notification = "empty text";
    // notification = getNotification(1);
    //console.log(notification);
    //document.getElementById("resultDiv").innerHTML = notification;
    getNotification()
    return (
        <div>
            <h4>Notifications List</h4>
            <div id="resultDiv"></div>
        </div>
    );
}
