/*
|--------------------------------------------------------------------------
| Run Scheduler
|--------------------------------------------------------------------------
|
| Run the scheduler on boot of the web sever.
|
*/
const { format } = use('date-fns')
const Logger = use('Logger')
const log = Logger.transport('file')

const Scheduler = use('Scheduler')
Scheduler.run()

log.info(
  `${format(new Date(), 'dd/MM/yyyy HH:mm:ss zzzz')} Scheduler is runing...`
)
