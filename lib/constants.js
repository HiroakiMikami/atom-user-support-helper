'use babel';

const packageName = "user-support-helper"
const packagePath = atom.packages.resolvePackagePath(packageName)
const pugDirectoryPath = `${packagePath}/pug`

export {
  packageName as PACKAGE_NAME,
  packagePath as PACKAGE_PATH,
  pugDirectoryPath as PUG_DIRECTORY_PATH
}
