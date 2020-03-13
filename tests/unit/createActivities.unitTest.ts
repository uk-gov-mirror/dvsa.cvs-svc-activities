import { ActivityService } from "../../src/services/ActivityService";
import { HTTPResponse } from "../../src/utils/HTTPResponse";
import { HTTPRESPONSE } from "../../src/assets/enums";
import {DynamoDBService} from "../../src/services/DynamoDBService";

describe("createActivity", () => {
    const visitId: string = "5e4bd304-446e-4678-8289-d34fca9256e8"; // existing-parentId
    context("when the payload is missing the", () => {
        const activityService = new ActivityService(new DynamoDBService());
        context("activityType attribute", () => {
            const payload: any = {
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"activityType\" is required");
                    });
            });
        });

        context("parentId attribute for 'visit' activityType is not required", () => {
            const payload: any = {
                parentId: visitId,
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerEmail: "tester@dvsa.gov.uk",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual(`${HTTPRESPONSE.PARENT_ID_NOT_REQUIRED}`);
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
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testStationName\" is required");
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
                expect.assertions(1);
                return activityService.createActivity(payload)
                  .catch((error: HTTPResponse) => {
                      const body: any = JSON.parse(error.body);
                      expect(body.error).toEqual("\"testStationPNumber\" is required");
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
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testStationEmail\" is required");
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
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testStationType\" is required");
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
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testerName\" is required");
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
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testerStaffId\" is required");
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
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"activityType\" must be one of [visit, wait, unaccountable time]");
                    });
            });
        });

        context("and testStationEmail does not meet the requirements", () => {
            const payload: any = {
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "malformed email",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testStationEmail\" must be a valid email");
                    });
            });
        });

        context("and testStationType does not meet the requirements", () => {
            const payload: any = {
                activityType: "visit",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts-inavlid",
                testerName: "Gica",
                testerStaffId: "132"
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testStationType\" must be one of [atf, gvts, hq]");
                    });
            });
        });

        context("and waitReason does not meet the requirements", () => {
            const payload: any = {
                parentId: visitId,
                activityType: "wait",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132",
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                waitReason: ["invalidReason", "Break"],
                notes: null
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"waitReason\" at position 0 does not match any of the allowed types");
                    });
            });
        });

        context("and parentId does not exist as a visit activity", () => {
            const payload: any = {
                parentId: "non-existingID",
                activityType: "wait",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132",
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                waitReason: ["Break"],
                notes: "sample notes"
            };

            it("should return an error", () => {
                DynamoDBService.prototype.get = jest.fn().mockResolvedValue({startTime: new Date(), endTime: new Date()});
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual(`${HTTPRESPONSE.PARENT_ID_NOT_EXIST}`);
                    });
            });
        });
    });

    context("when the payload is correct for 'visit' activityType", () => {
        const payload: any = {
            activityType: "visit",
            testStationName: "Rowe, Wunsch and Wisoky",
            testStationPNumber: "87-1369569",
            testStationEmail: "teststationname@dvsa.gov.uk",
            testStationType: "gvts",
            testerName: "Gica",
            testerEmail: "tester@dvsa.gov.uk",
            testerStaffId: "132"
        };

        it("should return a uuid", () => {
            DynamoDBService.prototype.getOngoingByStaffId = jest.fn().mockResolvedValue({Count: 0});
            DynamoDBService.prototype.put = jest.fn().mockResolvedValue({id: "00000000-0000-0000-0000-0000000000000"});
            const activityService = new ActivityService(new DynamoDBService());
            expect.assertions(1);
            return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    expect(result.id).toMatch(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
                })
              .catch((e) => {
                  console.log("Error", e);
              });
        });
    });

    context("when the payload for 'visit' activityType has startTime and endTime", () => {
        const payload: any = {
            activityType: "visit",
            testStationName: "Rowe, Wunsch and Wisoky",
            testStationPNumber: "87-1369569",
            testStationEmail: "teststationname@dvsa.gov.uk",
            testStationType: "gvts",
            testerName: "Gica",
            testerStaffId: "139",
            testerEmail: "tester@dvsa.gov.uk",
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
        };

        it("should return an activity", () => {
            DynamoDBService.prototype.getOngoingByStaffId = jest.fn().mockResolvedValue({Count: 0});
            DynamoDBService.prototype.put = jest.fn().mockResolvedValue({id: "00000000-0000-0000-0000-0000000000000"});
            const activityService = new ActivityService(new DynamoDBService());
            expect.assertions(1);
            return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    expect(result.id).toMatch(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
                });
        });
    });

    context("when the payload is correct for 'wait' activityType", () => {
        const payload: any = {
            parentId: visitId,
            activityType: "wait",
            testStationName: "Rowe, Wunsch and Wisoky",
            testStationPNumber: "87-1369569",
            testStationEmail: "teststationname@dvsa.gov.uk",
            testStationType: "gvts",
            testerName: "Gica",
            testerStaffId: "132",
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            waitReason: [],
            notes: null
        };

        it("should return a uuid", () => {
            DynamoDBService.prototype.get = jest.fn().mockResolvedValue({Item: {}, startTime: new Date(), endTime: new Date()});
            DynamoDBService.prototype.put = jest.fn().mockResolvedValue({id: "00000000-0000-0000-0000-0000000000000"});
            const activityService = new ActivityService(new DynamoDBService());
            expect.assertions(1);
            return activityService.createActivity(payload)
                .then((result: { id: string }) => {
                    expect(result.id).toMatch(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
                });
        });
    });

    // 'wait' or 'unaccountable time' activityType creation Test validations
    context("when the payload is missing the", () => {
        context("parentId attribute for 'wait' or 'unaccountable time' activityType", () => {
            const payload: any = {
                activityType: "wait",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132",
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual(`${HTTPRESPONSE.PARENT_ID_REQUIRED}`);
                    });
            });
        });

        context("testStationName attribute", () => {
            const payload: any = {
                parentId: visitId,
                activityType: "wait",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132",
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testStationName\" is required");
                    });
            });
        });

        context("testStationPNumber attribute", () => {
            const payload: any = {
                parentId: visitId,
                activityType: "wait",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132",
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testStationPNumber\" is required");
                    });
            });
        });

        context("testStationEmail attribute", () => {
            const payload: any = {
                parentId: visitId,
                activityType: "wait",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132",
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testStationEmail\" is required");
                    });
            });
        });

        context("testStationType attribute", () => {
            const payload: any = {
                parentId: visitId,
                activityType: "unaccountable time",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testerName: "Gica",
                testerStaffId: "132",
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testStationType\" is required");
                    });
            });
        });

        context("testerName attribute", () => {
            const payload: any = {
                parentId: visitId,
                activityType: "wait",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerStaffId: "132",
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testerName\" is required");
                    });
            });
        });

        context("testerStaffId attribute", () => {
            const payload: any = {
                parentId: visitId,
                activityType: "unaccountable time",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString()
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual("\"testerStaffId\" is required");
                    });
            });
        });

        context("startTime attribute", () => {
            const payload: any = {
                parentId: visitId,
                activityType: "wait",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132",
                endTime: new Date().toISOString()
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual(`${HTTPRESPONSE.START_TIME_EMPTY}`);
                    });
            });
        });

        context("endTime attribute", () => {
            const payload: any = {
                parentId: visitId,
                activityType: "unaccountable time",
                testStationName: "Rowe, Wunsch and Wisoky",
                testStationPNumber: "87-1369569",
                testStationEmail: "teststationname@dvsa.gov.uk",
                testStationType: "gvts",
                testerName: "Gica",
                testerStaffId: "132",
                startTime: new Date().toISOString()
            };

            it("should return an error", () => {
                const activityService = new ActivityService(new DynamoDBService());
                expect.assertions(1);
                return activityService.createActivity(payload)
                    .catch((error: HTTPResponse) => {
                        const body: any = JSON.parse(error.body);
                        expect(body.error).toEqual(`${HTTPRESPONSE.END_TIME_EMPTY}`);
                    });
            });
        });
    });

});

