package com.vertexa.keystone.exception;

import com.vertexa.keystone.domain.enums.WorkOrderStatus;

public class IllegalWorkOrderTransitionException extends RuntimeException {
    private final WorkOrderStatus currentStatus;
    private final WorkOrderStatus requestedStatus;

    public IllegalWorkOrderTransitionException(WorkOrderStatus currentStatus, WorkOrderStatus requestedStatus) {
        super(String.format("Illegal transition from %s to %s", currentStatus, requestedStatus));
        this.currentStatus = currentStatus;
        this.requestedStatus = requestedStatus;
    }

    public WorkOrderStatus getCurrentStatus() { return currentStatus; }
    public WorkOrderStatus getRequestedStatus() { return requestedStatus; }
}
