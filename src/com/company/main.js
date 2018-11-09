{
    init: function(elevators, floors) {
        // Util
        var setDirectionSignal = function(elevator, destinationFloor) {
            var currentFloor = elevator.currentFloor();

            if (currentFloor === floors.length - 1) {
                setGoingDown(elevator);
            } else if (currentFloor === 0) {
                setGoingUp(elevator);
            } else {
                elevator.goingUpIndicator(destinationFloor >= currentFloor);
                elevator.goingDownIndicator(destinationFloor <= currentFloor);
            }
        }

        var setGoingUp = function(elevator) {
            elevator.goingUpIndicator(true);
            elevator.goingDownIndicator(false);
        }

        var setGoingDown = function(elevator) {
            elevator.goingUpIndicator(false);
            elevator.goingDownIndicator(true);
        }

        var insertDestination = function(elevator, floorNum) {
            elevator.idle = false;

            var currentDestinationQueue = elevator.destinationQueue;
            var destinationQueueLength = currentDestinationQueue.length;
            var currentDirection = elevator.destinationDirection();

            if (destinationQueueLength > 0) {
                if (currentDirection === "up") {
                    if (floorNum > currentDestinationQueue[destinationQueueLength - 1]) {
                        elevator.destinationQueue.splice(i, 0, floorNum);
                    } else {
                        for (var i = 0; i < destinationQueueLength - 1; i++) {
                            if (floorNum < currentDestinationQueue[i]) {
                                elevator.destinationQueue.splice(i, 0, floorNum);
                                break;
                            }
                        }
                    }
                } else if (currentDirection === "down") {
                    if (floorNum < currentDestinationQueue[destinationQueueLength - 1]) {
                        elevator.destinationQueue.push(floorNum);
                    } else {
                        for (var i = 0; i < destinationQueueLength; i++) {
                            if (floorNum > currentDestinationQueue[i]) {
                                elevator.destinationQueue.splice(i, 0, floorNum);
                                break;
                            }
                        }
                    }
                } else {
                    var pressedFloors = elevator.getPressedFloors();
                    if (pressedFloors[0] > elevator.currentFloor()) {
                        if (floorNum > currentDestinationQueue[destinationQueueLength - 1]) {
                            elevator.destinationQueue.push(floorNum);
                        } else {
                            for (var i = 0; i < pressedFloors.length; i++) {
                                if (floorNum < currentDestinationQueue[i]) {
                                    elevator.destinationQueue.splice(i, 0, floorNum);
                                    break;
                                }
                            }
                        }
                    } else {
                        if (floorNum < currentDestinationQueue[destinationQueueLength - 1]) {
                            elevator.destinationQueue.push(floorNum);
                        } else {
                            for (var i = 0; i < destinationQueueLength; i++) {
                                if (floorNum > currentDestinationQueue[i]) {
                                    elevator.destinationQueue.splice(i, 0, floorNum);
                                    break;
                                }
                            }
                        }
                    }
                }
            } else {
                elevator.destinationQueue.push(floorNum);
            }
            elevator.checkDestinationQueue();
            setDirectionSignal(elevator, elevator.destinationQueue[0]);
        };

        //Elevators
        elevators.forEach(function(elevator) {

            elevator.on("idle", function() {
                elevator.idle = true;
                for (var i = 0; i < floors.length; i++) {
                    var floor = floors[i];
                    if (floor.buttonStates.up === "activated" || floor.buttonStates.down === "activated" ) {
                        insertDestination(elevator, floor.floorNum());
                    }
                }
            });

            elevator.on("floor_button_pressed", function(floorNum) {
                insertDestination(elevator, floorNum);
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                if (floors[floorNum].buttonStates[direction] === "activated") {
                    insertDestination(elevator, floorNum);
                }
            });

            elevator.on("stopped_at_floor", function(floorNum) {
                if (elevator.destinationQueue.length > 0) {
                    setDirectionSignal(elevator, elevator.destinationQueue[0]);
                } else {
                    if (floors[floorNum].buttonStates["up"] === "activated" &&
                        floors[floorNum].buttonStates["down"] !== "activated") {
                        setGoingUp(elevator);
                    } else if (floors[floorNum].buttonStates["up"] !== "activated" &&
                        floors[floorNum].buttonStates["down"] === "activated") {
                        setGoingDown(elevator);
                    } else {
                        setDirectionSignal(elevator, floorNum);
                    }
                }
            });

        });

        //Floors
        floors.forEach(function(floor) {
            floor.on("up_button_pressed", function() {
                for (i = 0; i < elevators.length; i++) {
                    if (elevators[i].idle) {
                        insertDestination(elevators[i], floor.floorNum());
                        break;
                    }
                }
            });
            floor.on("down_button_pressed", function() {
                for (i = 0; i < elevators.length; i++) {
                    if (elevators[i].idle) {
                        insertDestination(elevators[i], floor.floorNum());
                        break;
                    }
                }
            });
        });
    },

    update: function(dt, elevators, floors) {

    }
}
