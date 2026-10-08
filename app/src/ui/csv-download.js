export async function downloadExport(exportRecords,rows,columns,download,filename) {
  const csv=await exportRecords(rows,columns);
  if(typeof csv!=='string')throw new TypeError('Invalid CSV export');
  download(csv,filename);
}
