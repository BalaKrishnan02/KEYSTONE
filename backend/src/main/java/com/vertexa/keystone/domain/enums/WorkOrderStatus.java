package com.vertexa.keystone.domain.enums;

import java.util.EnumSet;
import java.util.Set;

public enum WorkOrderStatus {
    NEW,
    ASSIGNED,
    IN_PROGRESS,
    ON_HOLD,
    COMPLETED,
    CLOSED,
    CANCELLED;

    private static final Set<WorkOrderStatus> TERMINAL_STATUSES = EnumSet.of(CLOSED, CANCELLED);
    private static final Set<WorkOrderStatus> TECHNICIAN_ACTIONABLE_STATUSES = EnumSet.of(ASSIGNED, IN_PROGRESS, ON_HOLD);
    private static final Set<WorkOrderStatus> DISPATCHER_ACTIONABLE_STATUSES = EnumSet.of(NEW, ASSIGNED, IN_PROGRESS, ON_HOLD, COMPLETED);
    private static final Set<WorkOrderStatus> MANAGER_ACTIONABLE_STATUSES = EnumSet.allOf(WorkOrderStatus.class);

    public boolean isTerminal() {
        return TERMINAL_STATUSES.contains(this);
    }

    public boolean canTransitionTo(WorkOrderStatus newStatus, UserRole role) {
        if (this.isTerminal()) {
            return false;
        }
        if (newStatus == this) {
            return false;
        }

        return switch (this) {
            case NEW -> newStatus == ASSIGNED || newStatus == CANCELLED;
            case ASSIGNED -> newStatus == IN_PROGRESS || newStatus == ON_HOLD || newStatus == CANCELLED || newStatus == NEW;
            case IN_PROGRESS -> newStatus == ON_HOLD || newStatus == COMPLETED || newStatus == CANCELLED;
            case ON_HOLD -> newStatus == IN_PROGRESS || newStatus == CANCELLED;
            case COMPLETED -> newStatus == CLOSED || newStatus == ASSIGNED || newStatus == IN_PROGRESS;
            case CLOSED, CANCELLED -> false;
        };
    }

    public boolean isActionableBy(UserRole role) {
        return switch (role) {
            case TECHNICIAN -> TECHNICIAN_ACTIONABLE_STATUSES.contains(this);
            case DISPATCHER -> DISPATCHER_ACTIONABLE_STATUSES.contains(this);
            case MANAGER -> MANAGER_ACTIONABLE_STATUSES.contains(this);
            case CUSTOMER -> false;
        };
    }
}