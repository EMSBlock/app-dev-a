import React from "react";

export function NewNotification({new_notification}) {
  return (
    <div>
      <h4>Transfer</h4>
      <form
        onSubmit={(event) => {
          // This function just calls the transferTokens callback with the
          // form's data.
          event.preventDefault();

          const formData = new FormData(event.target);
          const _type = formData.get("_type");
          const _region = formData.get("_region");

          if (_type && _region) {
            new_notification(_type, _region);
          }
        }}
      >
        <div className="form-group">
          <label>Type of Disaster</label>
          <input className="form-control" step="1" name="_type" placeholder="1" required />
        </div>
        <div className="form-group">
          <label>Regions</label>
          <input className="form-control" step="1" name="_region" placeholder="1" required />
        </div>
        <div className="form-group">
          <input className="btn btn-primary" type="submit" value="Create Notification" />
        </div>
      </form>
    </div>
  );
}
