/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** Save a reservation (insert or update) */
  async save() {
    if (this.id === undefined) {
      // Insert new reservation
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = results.rows[0].id; // Assign the new reservation id to the instance
    } else {
      // Update existing reservation
      await db.query(
        `UPDATE reservations
        SET customer_id = $1, num_guests = $2, start_at = $3, notes = $4
        WHERE id = $5`,
        [this.customerId, this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }
  
  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    try {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    
    return results.rows.map(row => new Reservation(row));
  } catch (err){
    console.error(err.message); // Log the error for debugging
    throw err;
  }
}

}
module.exports = Reservation;
