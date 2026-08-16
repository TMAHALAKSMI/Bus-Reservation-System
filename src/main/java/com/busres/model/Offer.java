package com.busres.model;

import java.math.BigDecimal;

public class Offer {
    private int id;
    private String code;
    private String title;
    private String description;
    private int discountPercent;
    private BigDecimal maxDiscount;
    private String validTill;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String v) { this.code = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public int getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(int v) { this.discountPercent = v; }
    public BigDecimal getMaxDiscount() { return maxDiscount; }
    public void setMaxDiscount(BigDecimal v) { this.maxDiscount = v; }
    public String getValidTill() { return validTill; }
    public void setValidTill(String v) { this.validTill = v; }
}
