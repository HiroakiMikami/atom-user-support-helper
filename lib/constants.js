'use babel';

const packageName = "user-support-helper"
const package = atom.packages.getLoadedPackage(packageName)
const packagePath = (package) ? package.path : `${atom.configDirPath}/packages/user-support-helper`;

export {
  packageName as PACKAGE_NAME,
  packagePath as PACKAGE_PATH
}
