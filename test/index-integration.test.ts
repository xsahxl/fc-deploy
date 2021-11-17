import FcDeployComponent from '../src/index';
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
  DEFAULT_CLIENT_TIMEOUT,
  MOCK_PROJECT_PATH,
  // @ts-ignore
} from './mock-data';
import FC from '@alicloud/fc2';
import {
  cleanupIntegrationTestEnv,
  setupIntegrationTestEnv,
  // @ts-ignore
} from './test-utils';
import * as _ from 'lodash';
import fs from 'fs-extra';

dotenv.config({ path: path.join(__dirname, '.env') });

const accountId: string = process.env.AccountID;
const accessKeyId: string = process.env.AccessKeyID;
const accessKeySecret: string = process.env.AccessKeySecret;

const fcClient = new FC(accountId, {
  accessKeyID: accessKeyId,
  accessKeySecret: accessKeySecret,
  region: REGION,
  timeout: DEFAULT_CLIENT_TIMEOUT,
});

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

  afterAll(async () => {
    await cleanupIntegrationTestEnv(ACCESS, MOCK_PROJECT_PATH);
  });

  afterEach(async () => {
    await fs.remove(path.join(MOCK_PROJECT_PATH, '.s'));
  });

  it('deploy service with http trigger', async () => {
    const fcDeploy = new FcDeployComponent();
    try {
      const res: any = await fcDeploy.deploy(inputs);
      expect(res.function.serviceName).toBe(SERVICE_CONFIG.name);
      delete res.function.serviceName;
      expect(res.systemDomain).toBe(
        `https://${accountId}.${REGION}.fc.aliyuncs.com/2016-08-15/proxy/${SERVICE_CONFIG.name}/${FUNCTION_CONFIG.name}/`,
      );
      delete res.systemDomain;
      for (let i = 0; i < res.triggers.length; i++) {
        expect(res.triggers[i].serviceName).toEqual(SERVICE_CONFIG.name);
        expect(res.triggers[i].functionName).toEqual(FUNCTION_CONFIG.name);
        delete res.triggers[i].serviceName;
        delete res.triggers[i].functionName;
      }
      expect(res).toStrictEqual(inputs.props);
    } finally {
      try {
        await fcClient.deleteTrigger(
          SERVICE_CONFIG.name,
          FUNCTION_CONFIG.name,
          HTTP_TRIGGER_CONFIG.name,
        );
        await fcClient.deleteFunction(SERVICE_CONFIG.name, FUNCTION_CONFIG.name);
        await fcClient.deleteService(SERVICE_CONFIG.name);
        await fs.remove(path.join(MOCK_PROJECT_PATH, '.s'));
      } catch (e) {
        console.log(e);
      }
    }
  });
});
