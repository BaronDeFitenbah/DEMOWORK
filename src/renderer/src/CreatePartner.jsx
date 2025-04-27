import { useEffect } from "react"
import { Link } from "react-router";

export default function CreatePartner() {
  useEffect(() => { document.title = 'Создать партнера' }, [])
  async function submitHandler(e) {
    e.preventDefault()
    const partner = {
      type: e.target.type.value,
      name: e.target.name.value,
      director: e.target.director.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      inn: e.target.inn.value,
      legal_address: e.target.legal_address.value,
      rating: e.target.rating.value
    }
    await window.api.createPartner(partner);
    document.querySelector('form').reset()
  }

  return <div className="form">
    <Link to={'/'}><button>{"<-- Назад"}</button></Link>
    
    <h1>Создать партнера</h1>
    <form onSubmit={(e) => submitHandler(e)}>
      <label htmlFor="name">Наименование:</label>
      <input id="name" type="text" required />
      <label htmlFor="type">Тип партнера:</label>
      <select name="" id="type" required>
        <option value="1">ЗАО</option>
        <option value="2">ООО</option>
        <option value="3">ПАО</option>
        <option value="4">ОАО</option>
      </select>
      <label htmlFor="rating">Рейтинг:</label>
      <input id="rating" type="number" step="1" min='0' max='100' required />
      <label htmlFor="legal_address">Адрес:</label>
      <input id="legal_address" type="text" required />
      <label htmlFor="director">ФИО директора:</label>
      <input id="director" type="text" required />
      <label htmlFor="phone">Телефон:</label>
      <input id="phone" type="tel" required />
      <label htmlFor="inn">ИНН:</label>
      <input id="inn" type="text" required />
      <label htmlFor="email">Email компании:</label>
      <input id="email" type="email" required />
      <button type="submit">Создать партнера</button>
    </form>
  </div>
}