import dotenv from 'dotenv';
import { IInputs } from '../src/interface';
import * as path from 'path';
import {
  ACCESS,
  REGION,
  SERVICE_CONFIG,
  FUNCTION_CONFIG,
  HTTP_TRIGGER_CONFIG,
  MOCK_PROJECT_YAML_PATH,
  MOCK_PROJECT_PATH,
  // @ts-ignore
} from './mock-data';
import {
  setupIntegrationTestEnv,
  // @ts-ignore
} from './test-utils';
import * as _ from 'lodash';

dotenv.config({ path: path.join(__dirname, '.env') });

const accountId: string = process.env.AccountID;
const accessKeyId: string = process.env.AccessKeyID;
const accessKeySecret: string = process.env.AccessKeySecret;

const commonInputs: IInputs = {
  appName: 'fc-deploy-test',
  project: {
    access: ACCESS,
    component: process.cwd(),
    projectName: 'test',
  },
  command: '',
  path: {
    configPath: MOCK_PROJECT_YAML_PATH,
  },
  args: '-y',
  props: {
    region: REGION,
    service: SERVICE_CONFIG,
    function: FUNCTION_CONFIG,
    triggers: [HTTP_TRIGGER_CONFIG],
  },
};

describe('Integration::deploy', () => {
  const inputs = _.cloneDeep(commonInputs);
  inputs.command = 'deploy';
  beforeAll(async () => {
    await setupIntegrationTestEnv(
      ACCESS,
      accountId,
      accessKeyId,
      accessKeySecret,
      MOCK_PROJECT_PATH,
      MOCK_PROJECT_YAML_PATH,
    );
  });

  // afterAll(async () => {
  //   await cleanupIntegrationTestEnv(ACCESS, MOCK_PROJECT_PATH);
  // });

  // afterEach(async () => {
  //   await fs.remove(path.join(MOCK_PROJECT_PATH, '.s'));
  // });

  it('deploy service with http trigger xxx', async () => {
    expect(123).toBe(123);
  });
});
