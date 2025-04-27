import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import log from 'electron-log'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import connectDB from './db';

async function getPartners() {
  try {
    const response = await global.dbclient.query(`SELECT
    T1.*,
    T3.type_name as organization_type,
      CASE WHEN sum(T2.quantity) > 300000 THEN 15
      WHEN sum(T2.quantity) > 50000 THEN 10
      WHEN sum(T2.quantity) > 10000 THEN 5
      ELSE 0 
      END as discount
    from partners as T1
    LEFT JOIN sales_history as T2 on T1.partner_id = T2.partner_id
    LEFT JOIN partner_types as T3 on T1.partner_type_id = T3.partner_type_id
    GROUP BY T1.partner_id, T3.type_name`)
    return response.rows
  } catch (e) {
    console.log(e)
  }
}
async function createPartner(event, partner) {
  const { type, name, director, email, phone, inn, legal_address, rating } = partner;

  try {
    const sql = `INSERT into partners (partner_type_id, name, director, email, phone, inn, legal_address, rating)
    values('${type}', '${name}', '${director}', '${email}', '${phone}', '${inn}', '${legal_address}', ${rating})`;

    await global.dbclient.query(sql)
    dialog.showMessageBox({ message: 'Успех! Партнер создан' })
  } catch (e) {
    console.log(e)
    dialog.showErrorBox('Ошибка', "Партнер с таким именем уже есть")
  }
}
async function updatePartner(event, partner) {
  const { id, type, name, director, email, phone, inn, legal_address, rating } = partner;

  try {
    const sql = `UPDATE partners
    SET name = '${name}', partner_type_id = '${type}', director='${director}', email='${email}', phone='${phone}', inn ='${inn}', legal_address='${legal_address}', rating='${rating}'
    WHERE partners.partner_id = ${id};`
    await global.dbclient.query(sql)
    dialog.showMessageBox({ message: 'Успех! Данные обновлены' })
    return;
  } catch (e) {
    dialog.showErrorBox('Неудалось обновить пользователя', 'Введены некорректные данные')
    return ('error')
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: join(__dirname, '../../resources/icon.ico'),
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  global.dbclient = await connectDB();

  ipcMain.handle('getPartners', getPartners)
  ipcMain.handle('createPartner', createPartner)
  ipcMain.handle('updatePartner', updatePartner)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
