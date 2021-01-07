const canUpdate = (fields) => {
  console.log(updates);
  const updates = Object.keys(fields);
  const allowedUpdates = [
    "firstName",
    "lastName",
    "email",
    "rut",
    "phone",
    "address",
    "civilState",
    "sexType",
    "birthDate",
  ];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  return isValidOperation;
};
// const campos = {
//   firstName: "Hector",
//   role: "hadmarcano",
// };
// console.log(canUpdate(campos));
