import React from "react";

export function CreateNotification({createNotification}) {
  return (
    <div>
      <h4>Transfer</h4>
      <form
        onSubmit={(event) => {
          // This function just calls the transferTokens callback with the
          // form's data.
          event.preventDefault();

          const formData = new FormData(event.target);
          const _note = formData.get("_note");

          if (_note) {
            createNotification(_note);
          }
        }}
      >
        <div className="form-group">
          <label>Note of message</label>
          <input className="form-control" step="1" name="_note" placeholder="1" required />
        </div>
        <div className="form-group">
          <input className="btn btn-primary" type="submit" value="Transfer" />
        </div>
      </form>
    </div>
  );
}
