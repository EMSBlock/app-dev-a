import React from "react";

function BuildButton (_id, submitVote) {
    
    let _clicker = document.createElement("input");
    _clicker.setAttribute("type", "button");
    _clicker.setAttribute("value", "Vote");

    let _button = document.createElement("form");
    //_button.setAttribute("onsubmit", "roar" );
    _button.onclick = (event)=>{submitVote(_id);}
    _button.appendChild(_clicker);

    return (_button);
}

export function GetNotifications({notifications, submitVote}) {
    if (notifications !== undefined) {
        var _tr = document.createElement("tr");
        document.getElementById("notifications-table").innerHTML = "";
        for (let i = 0; i < notifications.length; i++) {
            _tr = document.createElement("tr");

            var _td1 = document.createElement("td");
            _td1.innerHTML = notifications[i].message;
            //_td1.appendChild(document.createTextNode())

            var _td2 = document.createElement("td");
            _td2.innerHTML = notifications[i].votes;
            var _td3 = document.createElement("td");
            _td3.innerHTML = notifications[i].user;
            var _td4 = document.createElement("td");
            _td4.innerHTML = notifications[i].consensusReached;
            var _td5 = document.createElement("td");

            var el = document.createElement("div");
            el = BuildButton(i, submitVote);         
            _td5.appendChild(el);     

            _tr.appendChild(_td1);
            _tr.appendChild(_td2);
            _tr.appendChild(_td3);
            _tr.appendChild(_td4);
            _tr.appendChild(_td5);

            document.getElementById("notifications-table").appendChild(_tr);
        }
    }
}
