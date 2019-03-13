import {describe} from "mocha";
import {expect} from "chai";
import {Injector} from "../../src/models/injector/Injector";
import {ActivityService} from "../../src/services/ActivityService";
import {DynamoDBMockService} from "../models/DynamoDBMockService";
import {HTTPResponse} from "../../src/utils/HTTPResponse";

describe("createActivity", () => {
    const activityService: ActivityService = Injector.resolve<ActivityService>(ActivityService, [DynamoDBMockService]);

    context("when the payload is missing the", () => {
        context("activityType attribute", () => {
            const payload: any =   {
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                return activityService.createActivity(payload)
                    .then((result: { id: string }) => {
                        // The creation should not succeed
                        console.log(result);
                        expect.fail();
                    })
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).to.equal("\"activityType\" is required");
                    });
            });
        });

        context("testStationName attribute", () => {
            const payload: any = {
                activityType: "visit",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    // The creation should not succeed
                    console.log(result);
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"testStationName\" is required");
                });
            });
        });

        context("testStationPNumber attribute", () => {
            const payload: any = {
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    // The creation should not succeed
                    console.log(result);
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"testStationPNumber\" is required");
                });
            });
        });

        context("testStationEmail attribute", () => {
            const payload: any = {
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    // The creation should not succeed
                    console.log(result);
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"testStationEmail\" is required");
                });
            });
        });

        context("testStationType attribute", () => {
            const payload: any = {
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    // The creation should not succeed
                    console.log(result);
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"testStationType\" is required");
                });
            });
        });

        context("testerName attribute", () => {
            const payload: any = {
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    // The creation should not succeed
                    console.log(result);
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"testerName\" is required");
                });
            });
        });

        context("testerStaffId attribute", () => {
            const payload: any = {
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica"
            };

            it("should return an error", () => {
                return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    // The creation should not succeed
                    console.log(result);
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"testerStaffId\" is required");
                });
            });
        });
    });

    context("when payload is malformed", () => {
        context("and activityType does not meet the requirements", () => {
            const payload: any = {
                activityType: "bad_value",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    // The creation should not succeed
                    console.log(result);
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"activityType\" must be one of [visit, wait]");
                });
            });
        });

        context("and testStationEmail does not meet the requirements", () => {
            const payload: any = {
                activityType: "wait",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "malformed email",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    // The creation should not succeed
                    console.log(result);
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"testStationEmail\" must be a valid email");
                });
            });
        });

        context("and testStationType does not meet the requirements", () => {
            const payload: any = {
                activityType: "wait",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "malformed type",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    // The creation should not succeed
                    expect.fail();
                })
                .catch((error: HTTPResponse) => {
                    const body: any = JSON.parse(error.body);
                    expect(body.error).to.equal("\"testStationType\" must be one of [atf, gvts, hq]");
                });
            });
        });
    });

    context("when the payload is correct", () => {
        const payload: any = {
            activityType: "visit",
            testStationName: "Rowe, Wunsch and Wisoky",
            testStationPNumber: "87-1369569",
            testStationEmail: "teststationname@dvsa.gov.uk",
            testStationType: "gvts",
            testerName: "Gica",
            testerStaffId: "132"
        };

        it("should return a uuid", () => {
            return activityService.createActivity(payload)
            .then((result: { id: string }) => {
                expect(result.id).to.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
            })
            .catch((error: HTTPResponse) => {
                // The creation should not fail
                console.log(error);
                expect.fail();
            });
        });
    });

});

describe("endActivity", () => {
    const activityService: ActivityService = Injector.resolve<ActivityService>(ActivityService, [DynamoDBMockService]);
    let activityId: string = "5e4bd304-446e-4678-8289-d34fca9256e9"; // Non-existing ID

    context("when the activity does not exist", () => {
        it("should return an error", () => {
            return activityService.endActivity(activityId)
            .then(() => {
                // The creation should not succeed
                expect.fail();
            })
            .catch((error: HTTPResponse) => {
                const body: any = JSON.parse(error.body);
                expect(body.error).to.equal(`Activity id does not exist`);
            });
        });
    });

    context("when the activity has successfully ended", () => {
        it("should return void", async () => {
            // Create the activity
            const payload: any = {
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132"
            };

            activityId = (await activityService.createActivity(payload)).id;

            // If the call does not throw errors, it is successful
            return activityService.endActivity(activityId)
            .catch((error: HTTPResponse) => {
                // The creation should succeed
                console.log(error);
                expect.fail();
            });
        });
    });

    context("when the activity has already ended", () => {
        it("should return an error", async () => {
            return activityService.endActivity(activityId)
            .then(() => {
                // The creation should not succeed
                expect.fail();
            })
            .catch((error: HTTPResponse) => {
                const body: any = JSON.parse(error.body);
                expect(body.error).to.equal(`Activity already ended`);
            });
        });
    });

});
