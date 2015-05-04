var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'NodeJs-Cobrador',
  script: 'E:\\Projetos\\NodeJs\\Cobrador\\server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('uninstall',function(){
	console.log('Uninstall complete.');
});

svc.uninstall();
