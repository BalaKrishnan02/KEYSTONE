package com.vertexa.keystone.exception;

public class InsufficientStockException extends RuntimeException {
    private final String partCode;
    private final int requested;
    private final int available;

    public InsufficientStockException(String partCode, int requested, int available) {
        super(String.format("Insufficient stock for part %s: requested %d, available %d", partCode, requested, available));
        this.partCode = partCode;
        this.requested = requested;
        this.available = available;
    }

    public String getPartCode() { return partCode; }
    public int getRequested() { return requested; }
    public int getAvailable() { return available; }
}
