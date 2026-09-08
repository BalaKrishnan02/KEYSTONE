package com.vertexa.keystone.domain.enums;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class WorkOrderStatusTest {

    @Nested
    @DisplayName("NEW transitions")
    class NewTransitions {

        @Test
        @DisplayName("NEW -> ASSIGNED is valid")
        void newToAssigned() {
            assertTrue(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.ASSIGNED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("NEW -> CANCELLED is valid")
        void newToCancelled() {
            assertTrue(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.CANCELLED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("NEW -> IN_PROGRESS is invalid")
        void newToInProgress() {
            assertFalse(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.IN_PROGRESS, UserRole.MANAGER));
        }

        @Test
        @DisplayName("NEW -> COMPLETED is invalid")
        void newToCompleted() {
            assertFalse(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.COMPLETED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("NEW -> NEW is invalid (no self-transition)")
        void newToNew() {
            assertFalse(WorkOrderStatus.NEW.canTransitionTo(WorkOrderStatus.NEW, UserRole.MANAGER));
        }
    }

    @Nested
    @DisplayName("ASSIGNED transitions")
    class AssignedTransitions {

        @Test
        @DisplayName("ASSIGNED -> IN_PROGRESS is valid")
        void assignedToInProgress() {
            assertTrue(WorkOrderStatus.ASSIGNED.canTransitionTo(WorkOrderStatus.IN_PROGRESS, UserRole.TECHNICIAN));
        }

        @Test
        @DisplayName("ASSIGNED -> ON_HOLD is valid")
        void assignedToOnHold() {
            assertTrue(WorkOrderStatus.ASSIGNED.canTransitionTo(WorkOrderStatus.ON_HOLD, UserRole.MANAGER));
        }

        @Test
        @DisplayName("ASSIGNED -> CANCELLED is valid")
        void assignedToCancelled() {
            assertTrue(WorkOrderStatus.ASSIGNED.canTransitionTo(WorkOrderStatus.CANCELLED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("ASSIGNED -> NEW is valid")
        void assignedToNew() {
            assertTrue(WorkOrderStatus.ASSIGNED.canTransitionTo(WorkOrderStatus.NEW, UserRole.MANAGER));
        }

        @Test
        @DisplayName("ASSIGNED -> COMPLETED is invalid")
        void assignedToCompleted() {
            assertFalse(WorkOrderStatus.ASSIGNED.canTransitionTo(WorkOrderStatus.COMPLETED, UserRole.TECHNICIAN));
        }

        @Test
        @DisplayName("ASSIGNED -> CLOSED is invalid")
        void assignedToClosed() {
            assertFalse(WorkOrderStatus.ASSIGNED.canTransitionTo(WorkOrderStatus.CLOSED, UserRole.MANAGER));
        }
    }

    @Nested
    @DisplayName("IN_PROGRESS transitions")
    class InProgressTransitions {

        @Test
        @DisplayName("IN_PROGRESS -> ON_HOLD is valid")
        void inProgressToOnHold() {
            assertTrue(WorkOrderStatus.IN_PROGRESS.canTransitionTo(WorkOrderStatus.ON_HOLD, UserRole.TECHNICIAN));
        }

        @Test
        @DisplayName("IN_PROGRESS -> COMPLETED is valid")
        void inProgressToCompleted() {
            assertTrue(WorkOrderStatus.IN_PROGRESS.canTransitionTo(WorkOrderStatus.COMPLETED, UserRole.TECHNICIAN));
        }

        @Test
        @DisplayName("IN_PROGRESS -> CANCELLED is valid")
        void inProgressToCancelled() {
            assertTrue(WorkOrderStatus.IN_PROGRESS.canTransitionTo(WorkOrderStatus.CANCELLED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("IN_PROGRESS -> ASSIGNED is invalid")
        void inProgressToAssigned() {
            assertFalse(WorkOrderStatus.IN_PROGRESS.canTransitionTo(WorkOrderStatus.ASSIGNED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("IN_PROGRESS -> NEW is invalid")
        void inProgressToNew() {
            assertFalse(WorkOrderStatus.IN_PROGRESS.canTransitionTo(WorkOrderStatus.NEW, UserRole.MANAGER));
        }
    }

    @Nested
    @DisplayName("ON_HOLD transitions")
    class OnHoldTransitions {

        @Test
        @DisplayName("ON_HOLD -> IN_PROGRESS is valid")
        void onHoldToInProgress() {
            assertTrue(WorkOrderStatus.ON_HOLD.canTransitionTo(WorkOrderStatus.IN_PROGRESS, UserRole.TECHNICIAN));
        }

        @Test
        @DisplayName("ON_HOLD -> CANCELLED is valid")
        void onHoldToCancelled() {
            assertTrue(WorkOrderStatus.ON_HOLD.canTransitionTo(WorkOrderStatus.CANCELLED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("ON_HOLD -> COMPLETED is invalid")
        void onHoldToCompleted() {
            assertFalse(WorkOrderStatus.ON_HOLD.canTransitionTo(WorkOrderStatus.COMPLETED, UserRole.TECHNICIAN));
        }

        @Test
        @DisplayName("ON_HOLD -> ASSIGNED is invalid")
        void onHoldToAssigned() {
            assertFalse(WorkOrderStatus.ON_HOLD.canTransitionTo(WorkOrderStatus.ASSIGNED, UserRole.MANAGER));
        }
    }

    @Nested
    @DisplayName("COMPLETED transitions")
    class CompletedTransitions {

        @Test
        @DisplayName("COMPLETED -> CLOSED is valid")
        void completedToClosed() {
            assertTrue(WorkOrderStatus.COMPLETED.canTransitionTo(WorkOrderStatus.CLOSED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("COMPLETED -> ASSIGNED is valid (reassignment)")
        void completedToAssigned() {
            assertTrue(WorkOrderStatus.COMPLETED.canTransitionTo(WorkOrderStatus.ASSIGNED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("COMPLETED -> IN_PROGRESS is valid (reopen)")
        void completedToInProgress() {
            assertTrue(WorkOrderStatus.COMPLETED.canTransitionTo(WorkOrderStatus.IN_PROGRESS, UserRole.MANAGER));
        }

        @Test
        @DisplayName("COMPLETED -> CANCELLED is invalid")
        void completedToCancelled() {
            assertFalse(WorkOrderStatus.COMPLETED.canTransitionTo(WorkOrderStatus.CANCELLED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("COMPLETED -> NEW is invalid")
        void completedToNew() {
            assertFalse(WorkOrderStatus.COMPLETED.canTransitionTo(WorkOrderStatus.NEW, UserRole.MANAGER));
        }
    }

    @Nested
    @DisplayName("CLOSED terminal status")
    class ClosedTerminal {

        @Test
        @DisplayName("CLOSED is terminal")
        void closedIsTerminal() {
            assertTrue(WorkOrderStatus.CLOSED.isTerminal());
        }

        @Test
        @DisplayName("CLOSED -> NEW is invalid")
        void closedToNew() {
            assertFalse(WorkOrderStatus.CLOSED.canTransitionTo(WorkOrderStatus.NEW, UserRole.MANAGER));
        }

        @Test
        @DisplayName("CLOSED -> ASSIGNED is invalid")
        void closedToAssigned() {
            assertFalse(WorkOrderStatus.CLOSED.canTransitionTo(WorkOrderStatus.ASSIGNED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("CLOSED -> IN_PROGRESS is invalid")
        void closedToInProgress() {
            assertFalse(WorkOrderStatus.CLOSED.canTransitionTo(WorkOrderStatus.IN_PROGRESS, UserRole.MANAGER));
        }

        @Test
        @DisplayName("CLOSED -> ON_HOLD is invalid")
        void closedToOnHold() {
            assertFalse(WorkOrderStatus.CLOSED.canTransitionTo(WorkOrderStatus.ON_HOLD, UserRole.MANAGER));
        }

        @Test
        @DisplayName("CLOSED -> COMPLETED is invalid")
        void closedToCompleted() {
            assertFalse(WorkOrderStatus.CLOSED.canTransitionTo(WorkOrderStatus.COMPLETED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("CLOSED -> CANCELLED is invalid")
        void closedToCancelled() {
            assertFalse(WorkOrderStatus.CLOSED.canTransitionTo(WorkOrderStatus.CANCELLED, UserRole.MANAGER));
        }
    }

    @Nested
    @DisplayName("CANCELLED terminal status")
    class CancelledTerminal {

        @Test
        @DisplayName("CANCELLED is terminal")
        void cancelledIsTerminal() {
            assertTrue(WorkOrderStatus.CANCELLED.isTerminal());
        }

        @Test
        @DisplayName("CANCELLED -> NEW is invalid")
        void cancelledToNew() {
            assertFalse(WorkOrderStatus.CANCELLED.canTransitionTo(WorkOrderStatus.NEW, UserRole.MANAGER));
        }

        @Test
        @DisplayName("CANCELLED -> ASSIGNED is invalid")
        void cancelledToAssigned() {
            assertFalse(WorkOrderStatus.CANCELLED.canTransitionTo(WorkOrderStatus.ASSIGNED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("CANCELLED -> IN_PROGRESS is invalid")
        void cancelledToInProgress() {
            assertFalse(WorkOrderStatus.CANCELLED.canTransitionTo(WorkOrderStatus.IN_PROGRESS, UserRole.MANAGER));
        }

        @Test
        @DisplayName("CANCELLED -> ON_HOLD is invalid")
        void cancelledToOnHold() {
            assertFalse(WorkOrderStatus.CANCELLED.canTransitionTo(WorkOrderStatus.ON_HOLD, UserRole.MANAGER));
        }

        @Test
        @DisplayName("CANCELLED -> COMPLETED is invalid")
        void cancelledToCompleted() {
            assertFalse(WorkOrderStatus.CANCELLED.canTransitionTo(WorkOrderStatus.COMPLETED, UserRole.MANAGER));
        }

        @Test
        @DisplayName("CANCELLED -> CLOSED is invalid")
        void cancelledToClosed() {
            assertFalse(WorkOrderStatus.CANCELLED.canTransitionTo(WorkOrderStatus.CLOSED, UserRole.MANAGER));
        }
    }

    @Nested
    @DisplayName("Non-terminal status checks")
    class NonTerminalStatuses {

        @Test
        @DisplayName("NEW is not terminal")
        void newIsNotTerminal() {
            assertFalse(WorkOrderStatus.NEW.isTerminal());
        }

        @Test
        @DisplayName("ASSIGNED is not terminal")
        void assignedIsNotTerminal() {
            assertFalse(WorkOrderStatus.ASSIGNED.isTerminal());
        }

        @Test
        @DisplayName("IN_PROGRESS is not terminal")
        void inProgressIsNotTerminal() {
            assertFalse(WorkOrderStatus.IN_PROGRESS.isTerminal());
        }

        @Test
        @DisplayName("ON_HOLD is not terminal")
        void onHoldIsNotTerminal() {
            assertFalse(WorkOrderStatus.ON_HOLD.isTerminal());
        }

        @Test
        @DisplayName("COMPLETED is not terminal")
        void completedIsNotTerminal() {
            assertFalse(WorkOrderStatus.COMPLETED.isTerminal());
        }
    }
}
