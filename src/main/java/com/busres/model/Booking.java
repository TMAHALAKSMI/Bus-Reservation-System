package com.busres.model;

import java.math.BigDecimal;

public class Booking {
    private int id;
    private int userId;
    private int busId;
    private String seatNumbers;
    private String passengerName;
    private int passengerAge;
    private String passengerGender;
    private BigDecimal totalAmount;
    private String offerCode;
    private String status;
    private String pnr;
    private String bookedAt;
    private String cancelledAt;
    private String cancelReason;
    private BigDecimal refundAmount;
    // Joined trip info (for "My Bookings" display)
    private String operatorName;
    private String fromCity;
    private String toCity;
    private String travelDate;
    private String departureTime;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getUserId() { return userId; }
    public void setUserId(int v) { this.userId = v; }
    public int getBusId() { return busId; }
    public void setBusId(int v) { this.busId = v; }
    public String getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(String v) { this.seatNumbers = v; }
    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String v) { this.passengerName = v; }
    public int getPassengerAge() { return passengerAge; }
    public void setPassengerAge(int v) { this.passengerAge = v; }
    public String getPassengerGender() { return passengerGender; }
    public void setPassengerGender(String v) { this.passengerGender = v; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal v) { this.totalAmount = v; }
    public String getOfferCode() { return offerCode; }
    public void setOfferCode(String v) { this.offerCode = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public String getPnr() { return pnr; }
    public void setPnr(String v) { this.pnr = v; }
    public String getBookedAt() { return bookedAt; }
    public void setBookedAt(String v) { this.bookedAt = v; }
    public String getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(String v) { this.cancelledAt = v; }
    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String v) { this.cancelReason = v; }
    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal v) { this.refundAmount = v; }
    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String v) { this.operatorName = v; }
    public String getFromCity() { return fromCity; }
    public void setFromCity(String v) { this.fromCity = v; }
    public String getToCity() { return toCity; }
    public void setToCity(String v) { this.toCity = v; }
    public String getTravelDate() { return travelDate; }
    public void setTravelDate(String v) { this.travelDate = v; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String v) { this.departureTime = v; }
}
