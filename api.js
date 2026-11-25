'use strict';
async function apiRequest(payload){const response=await fetch(API_URL,payload?{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload),credentials:'omit',redirect:'follow'}:{credentials:'omit',redirect:'follow'});if(!response.ok)throw Error('HTTP '+response.status);return response.json();}
