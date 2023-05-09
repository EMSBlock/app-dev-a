import React from "react";


export function BuildNotificationsList(messages, _submit_vote) {
    var complete_list = document.getElementById("notifications-list");
    let big_string = "<p>No Notifications</p>";
    if (messages.length > 0) {
        big_string = "<div style='overflow-x:auto'><table id='notifications-table'>"
        big_string += "<tr><th>Title</th><th>Votes</th><th>Creator</th><th>Consensus</th></tr>"
        for (let i = 0; i < messages.length; i++) {
            big_string += 
                "<tr>" + 
                "<td>" + messages[i][1] + "</td>" + 
                "<td>" + messages[i][2] + "</td>" + 
                "<td>" + messages[i][0] + "</td>" + 
                "<td>" + messages[i][3] + "</td>" + 
                "<td></td>" +
                "</tr>";
        }
        big_string += "</table></div>";
    }
    complete_list.innerHTML = big_string;
}