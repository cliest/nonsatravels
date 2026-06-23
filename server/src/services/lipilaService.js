import axios from 'axios';

const BASE_URL = process.env.LIPILA_BASE_URL || 'https://blz.lipila.io';
const API_KEY = process.env.LIPILA_API_KEY;

const baseHeaders = {
  accept: 'application/json',
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

export const initiateMoMoCollection = async ({ referenceId, amount, narration, accountNumber, currency = 'USD', email }) => {
  const response = await axios.post(
    `${BASE_URL}/api/v1/collections/mobile-money`,
    { referenceId, amount, narration, accountNumber, currency, email },
    { headers: baseHeaders }
  );
  return response.data;
};

export const initiateCardCollection = async ({ customerInfo, collectionRequest, callbackUrl }) => {
  const response = await axios.post(
    `${BASE_URL}/api/v1/collections/card`,
    { customerInfo, collectionRequest },
    { headers: callbackUrl ? { ...baseHeaders, callbackUrl } : baseHeaders }
  );
  return response.data;
};

export const checkCollectionStatus = async (referenceId) => {
  const response = await axios.get(
    `${BASE_URL}/api/v1/collections/check-status`,
    {
      params: { referenceId },
      headers: { accept: 'application/json', 'x-api-key': API_KEY },
    }
  );
  return response.data;
};
