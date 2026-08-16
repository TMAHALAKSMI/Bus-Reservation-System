package com.busres.model;

import java.math.BigDecimal;

public class Bus {
    private int id;
    private String operatorName;
    private String busType;
    private String fromCity;
    private String toCity;
    private String travelDate;
    private String departureTime;
    private String arrivalTime;
    private int durationMin;
    private int totalSeats;
    private int availableSeats;   // computed at query time
    private BigDecimal fare;
    private double rating;
    private String amenities;
    private String imageUrl;
    private String boardingPoint;
    private String droppingPoint;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String v) { this.operatorName = v; }
    public String getBusType() { return busType; }
    public void setBusType(String v) { this.busType = v; }
    public String getFromCity() { return fromCity; }
    public void setFromCity(String v) { this.fromCity = v; }
    public String getToCity() { return toCity; }
    public void setToCity(String v) { this.toCity = v; }
    public String getTravelDate() { return travelDate; }
    public void setTravelDate(String v) { this.travelDate = v; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String v) { this.departureTime = v; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String v) { this.arrivalTime = v; }
    public int getDurationMin() { return durationMin; }
    public void setDurationMin(int v) { this.durationMin = v; }
    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int v) { this.totalSeats = v; }
    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int v) { this.availableSeats = v; }
    public BigDecimal getFare() { return fare; }
    public void setFare(BigDecimal v) { this.fare = v; }
    public double getRating() { return rating; }
    public void setRating(double v) { this.rating = v; }
    public String getAmenities() { return amenities; }
    public void setAmenities(String v) { this.amenities = v; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String v) { this.imageUrl = v; }
    public String getBoardingPoint() { return boardingPoint; }
    public void setBoardingPoint(String v) { this.boardingPoint = v; }
    public String getDroppingPoint() { return droppingPoint; }
    public void setDroppingPoint(String v) { this.droppingPoint = v; }
}
