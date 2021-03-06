import { Account, Address } from 'ontology-ts-crypto';
import { initClient, isDeployed, invoke } from 'ontology-ts-test';
import { AbiParamter } from '../abi/abiTypes';

export class Invoker {
  async invoke({
    rpcAddress,
    account,
    password,
    gasLimit,
    gasPrice,
    contract,
    method,
    parameters,
    preExec
  }: {
    rpcAddress: string;
    account?: Account;
    password?: string;
    gasLimit: string;
    gasPrice: string;
    contract: string;
    method: string;
    parameters?: any[];
    preExec: boolean;
  }) {
    const client = initClient({ rpcAddress });

    const deployed = await isDeployed({ client, scriptHash: contract });

    if (!deployed) {
      throw new Error('Contract is not deployed.');
    }

    const response = await invoke({
      client,
      account,
      password,
      gasLimit,
      gasPrice,
      contract,
      method,
      parameters,
      preExec,
      wait: false
    });

    const result = response.result;
    if (result !== undefined) {
      if (typeof result === 'string') {
        return result;
      }

      const inner = result.Result;

      if (inner !== undefined) {
        return inner;
      }
    }
  }
}

export function processParams(parameters: AbiParamter[], data: any) {
  return parameters.map((parameter) => {
    const value = data[parameter.name];
    const type = data[`${parameter.name}-type`];

    if (type === 'Integer') {
      return Number(value);
    } else if (type === 'Boolean') {
      return Boolean(value);
    } else if (type === 'String') {
      return value;
    } else if (type === 'ByteArray') {
      return new Buffer(value, 'hex');
    } else if (type === 'Address') {
      const address = Address.fromBase58(value);
      return address.toArray();
    }
  });
}
