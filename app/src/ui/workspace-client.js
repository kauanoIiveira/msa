import {requireThat} from '../domain/errors.js';
const backupRoots=['machines','processes','products','parameters','parameterVersions','reasons','targets','collections','production','losses','stoppages','reviews','corrections','productionPolicies','productionPlans','productionIntervals','plannedCorrections','machineRuns','targetRevisions','technicalRecords','productionCases','recipeVersions','coverageWitnesses','presentationManifests'];
export function connectionState({authenticated,authorized,connected,pending=false}) {
 if(!authenticated||!authorized)return 'forbidden';
 if(!connected)return 'offline';
 return pending?'pending':'ready';
}
export async function openWorkspaceClient({session,workspaceId,repository,manifest,services}) {
 const securedServices=services??await session.onWorkspace(workspaceId);
 const repo=session.repository?.()??repository;requireThat(repo?.get&&repo?.watch,'REPOSITORY_REQUIRED');
 manifest??=await securedServices.presentation?.latest();
 return {mode:'workspace',manifest:manifest?structuredClone(manifest):null,packageId:manifest?.packageId??null,services:securedServices,repo,defaultSelection:manifest?.defaultSelection?structuredClone(manifest.defaultSelection):null,
  async exportBackup(){const values={};for(const root of backupRoots)values[root]=await repo.get(root);return JSON.stringify({schemaVersion:1,workspaceId,exportedAt:new Date().toISOString(),values},null,2);},
  dispose(){}
 };
}
