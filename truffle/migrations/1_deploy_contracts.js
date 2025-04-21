const UserManagement = artifacts.require('UserManagement');
const MissingRegistry = artifacts.require('MissingRegistry');
const AppointmentSystem = artifacts.require('AppointmentSystem');

module.exports = async function (deployer) {
    await deployer.deploy(UserManagement);
    const userManagement = await UserManagement.deployed();
    console.log('UserManagement deployed at:', userManagement.address);

    await deployer.deploy(MissingRegistry, userManagement.address);
    const missingRegistry = await MissingRegistry.deployed();
    console.log('MissingRegistry deployed at:', missingRegistry.address);

    await deployer.deploy(
        AppointmentSystem,
        userManagement.address,
        missingRegistry.address,
    );
    const appointmentSystem = await AppointmentSystem.deployed();
    console.log('AppointmentSystem deployed at:', appointmentSystem.address);
};
