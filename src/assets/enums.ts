export enum HTTPRESPONSE {
  NO_RESOURCES = 'No resources match the search criteria',
  BAD_REQUEST = 'Bad Request',
  NOT_EXIST = 'Activity id does not exist',
  PARENT_ID_NOT_EXIST = 'Parent id does not exist',
  ALREADY_ENDED = 'Activity already ended',
  ONGOING_ACTIVITY_STAFF_ID = 'Staff ID',
  ONGING_ACTIVITY = 'already has an ongoing activity',
  NOT_VALID_JSON = 'Body is not a valid JSON.',
  AWS_EVENT_EMPTY = 'AWS event is empty. Check your test event.',
  PARENT_ID_NOT_REQUIRED = 'ParentId not required for visit activity type.',
  PARENT_ID_REQUIRED = 'ParentId is required.',
  START_TIME_EMPTY = 'Start Time not provided.',
  END_TIME_EMPTY = 'End Time not provided.',
  ACTIVITY_UPDATED = 'Activity updated'
}

export enum ERRORS {
  FUNCTION_NOT_DEFINED = 'Functions were not defined in the config file.',
  DYNAMODB_NOT_DEFINED = 'DynamoDB config is not defined in the config file.'
}

export enum ENV_VARIABLES {
  LOCAL = 'local',
  REMOTE = 'remote'
}

export enum QUERY_PARAMS {
  ACTIVITY_TYPE = 'activityType',
  TEST_STATION_P_NUMBER = 'testStationPNumber',
  TESTER_STAFF_ID = 'testerStaffId',
  END_TIME = 'endTime'
}

export enum ActivityType {
  VISIT = 'visit',
  WAIT = 'wait',
  UNACCOUNTABLE_TIME = 'unaccountable time'
}

export enum StationType {
  ATF = 'atf',
  GVTS = 'gvts',
  HQ = 'hq',
  POTF = 'potf'
}
