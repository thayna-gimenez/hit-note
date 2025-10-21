from tkinter import*
from tkinter import Tk, StringVar, ttk
from datetime import time

from crud.crud_musica import*

# Criando janela
janela = Tk()
janela.title('')
janela.geometry('900x600')
janela.configure(background="#e9edf5")
janela.resizable(width=TRUE, height=TRUE)

global tree

# Inserir no banco de dados
def inserirMusica():
    musica = entrada_musica.get()
    artista = entrada_artista.get()
    album = entrada_album.get()
    duracao = entrada_duracao.get()

    lista_inserir = [musica, artista, album, duracao]

    inserirDados(lista_inserir)

    entrada_musica.delete(0, 'end')
    entrada_artista.delete(0, 'end')
    entrada_album.delete(0, 'end')
    entrada_duracao.delete(0, 'end')

    mostrarDados()


# Definindo frames
frameCima = Frame(janela, width=1043, height=50, bg="#e9edf5", relief=FLAT)
frameCima.grid(row=0, column=0)

frameMeio = Frame(janela, width=1043, height=303, bg="#e9edf5", pady=20, relief=FLAT)
frameMeio.grid(row=1, column=0, pady=1, padx=0, sticky=NSEW)

frameBaixo = Frame(janela, width=1043, height=300, bg="#e9edf5", relief=FLAT)
frameBaixo.grid(row=2, column=0, pady=0, padx=1, sticky=NSEW)

# Criando campos de entrada
label_musica = Label(frameMeio, text='Nome da música:', height=1, anchor=NW, font=('Ivy 10 bold'), bg="#e9edf5", fg="#000000")
label_musica.place(x=10, y=10)
entrada_musica = Entry(frameMeio, width=30, justify='left', relief=SOLID)
entrada_musica.place(x=130, y=11)

label_artista = Label(frameMeio, text='Nome do artista:', height=1, anchor=NW, font=('Ivy 10 bold'), bg="#e9edf5", fg="#000000")
label_artista.place(x=10, y=40)
entrada_artista = Entry(frameMeio, width=30, justify='left', relief=SOLID)
entrada_artista.place(x=130, y=41)

label_album = Label(frameMeio, text='Nome do álbum:', height=1, anchor=NW, font=('Ivy 10 bold'), bg="#e9edf5", fg="#000000")
label_album.place(x=10, y=70)
entrada_album = Entry(frameMeio, width=30, justify='left', relief=SOLID)
entrada_album.place(x=130, y=71)

label_duracao = Label(frameMeio, text='Duração:', height=1, anchor=NW, font=('Ivy 10 bold'), bg="#e9edf5", fg="#000000")
label_duracao.place(x=10, y=100)
entrada_duracao = Entry(frameMeio, width=30, justify='left', relief=SOLID)
entrada_duracao.place(x=130, y=101)

# Criando botões
label_adicionar = Button(frameMeio, command=inserirMusica, text='enviar'.upper(), compound=CENTER, anchor=CENTER, font=('Ivy 10 bold'), bg="#e9edf5", fg="#000000")
label_adicionar.place(x=10, y=130)

def mostrarDados():
    # Criando tabela para visualizar dados
    header_tabela = ['#id', 'Música', 'Artista', 'Álbum', 'Duração']
    lista_itens = visualizarDados()

    tree = ttk.Treeview(frameBaixo, selectmode="extended", columns=header_tabela, show="headings")
    scrollbar_vertical = ttk.Scrollbar(frameBaixo, orient="vertical", command=tree.yview) # barra de navegação vertical
    scrollbar_horizontal = ttk.Scrollbar(frameBaixo, orient="horizontal", command=tree.yview) # barra de navegação horizontal

    tree.configure(yscrollcommand=scrollbar_vertical.set)
    tree.grid(column=0, row=0, sticky='nsew')
    scrollbar_vertical.grid(column=1, row=0, sticky='ns')
    scrollbar_horizontal.grid(column=0, row=1, sticky='ew')
    frameBaixo.grid_rowconfigure(0, weight=12)

    h = [100, 190, 190, 190, 190]
    n = 0

    for coluna in header_tabela:
        tree.heading(coluna, text=coluna.title(), anchor=CENTER)
        tree.column(coluna, width=h[n], anchor='center')
        n += 1

    # Inserindo itens na tabela
    for item in lista_itens:
        tree.insert('', 'end', values=item)

mostrarDados()
janela.mainloop()