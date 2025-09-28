const generateMsg = (entity) => ({
  alreadyExist: `${entity} aleady exist`,
  notFound: `${entity} not found`,
  failToCreate: `fail to create ${entity}`,
  failToUpdate: `fail to update`,
  sucess: `sucess`,
  notAllowed: `${entity} not allwed..`,
  updated: `${entity} updated sucessfully...`,
  deleted: `${entity} deleted sucessfully...`,
});
export const msg = {
  user: generateMsg("user"),
  post: generateMsg("post"),
  comment: generateMsg("comment"),
};
