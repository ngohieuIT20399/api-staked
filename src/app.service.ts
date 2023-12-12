import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { contractsInstance } from '../scripts/walletStorage';
import { GraphQLClient, gql } from 'graphql-request';
const graphqlClient = new GraphQLClient(
  'https://graph.uniultra.xyz/subgraphs/name/u2u/sfc-subgraph-v2',
);
import * as fs from 'fs';
import { Response } from 'express';
@Injectable()
export class AppService {
  private convertDateFormat = (createdOn: any) => {
    const timestamp = new Date(createdOn * 1000);
    const day = ('0' + timestamp.getDate()).slice(-2);
    const month = ('0' + (timestamp.getMonth() + 1)).slice(-2);
    const year = timestamp.getFullYear();
    const hours = ('0' + timestamp.getHours()).slice(-2);
    const minutes = ('0' + timestamp.getMinutes()).slice(-2);
    const seconds = ('0' + timestamp.getSeconds()).slice(-2);
    const outcreatedOn = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    return outcreatedOn;
  };

  private stakedAmountAccept = '14699999900000000000';

  async accepctAddress(id: string) {
    try {
      const transaction = await contractsInstance.storeWallets([id]);
      return transaction;
    } catch (err) {
      console.log(err);
      throw new HttpException(`${err.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async getListWallet() {
    try {
      const tx = await contractsInstance.getWallets();
      return tx;
    } catch (err) {
      console.log(err);
      throw new HttpException(`${err.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  removeDuplicateData(data: any[]) {
    return data.reduce((uniqueItems, currentItem) => {
      const isIdAlreadyExists = uniqueItems.some(
        (item: any) => item.id === currentItem.id,
      );
      if (!isIdAlreadyExists) {
        uniqueItems.push(currentItem);
      }
      return uniqueItems;
    }, []);
  }

  async CheckStaked(res: Response) {
    try {
      const query = gql`
        query getStaking($id: ID) {
          delegator(id: $id) {
            totalLockStake
            totalClaimedRewards
            stakedAmount
            id
            createdOn
            address
          }
        }
      `;
      const tx = await contractsInstance.getWallets();
      const result = await Promise.all(
        tx.map(async (item: any) => {
          const response = await graphqlClient.request(query, {
            id: item.toLowerCase(),
          });
          const { delegator }: any = response;
          if (delegator) {
            const timeStamp = this.convertDateFormat(delegator.createdOn);
            return { ...delegator, timeStamp };
          } else {
            return { address: item, id: item };
          }
        }),
      );
      const dataFormat = this.removeDuplicateData(result);
      const listStackedAccept = dataFormat.filter((item: any) => {
        if (Number(item.stakedAmount) >= Number(this.stakedAmountAccept)) {
          return item;
        }
      });
      const jsonString = JSON.stringify(listStackedAccept, null, 2);
      const filePath = 'output.json';
      fs.writeFile(filePath, jsonString, (err) => {
        if (err) {
          throw new Error(`${err.message}`);
        } else {
          return res.json({
            code: 200,
            message: 'Ghi file thành công',
            data: listStackedAccept,
          });
        }
      });
    } catch (err) {
      console.log(err);
      throw new HttpException(`${err.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
