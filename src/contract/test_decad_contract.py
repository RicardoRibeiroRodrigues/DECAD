import pytest
import boa
from eth_utils import to_wei
import os

path = os.path.dirname(os.path.abspath(__file__))


@pytest.fixture
def music_contract():
    return boa.load(os.path.join(path, "decad.vy"))


@pytest.fixture
def artist():
    artist = boa.env.generate_address("artist")
    boa.env.set_balance(artist, to_wei(10, "ether"))
    return artist


def test_register_music_once(music_contract, artist):
    music_contract.register_music("Primeira Música", sender=artist)
    assert music_contract.next_music_id() == 1


def test_duplicate_registration_should_fail(music_contract, artist):
    music_contract.register_music("Mesma Música", sender=artist)

    with boa.reverts():
        music_contract.register_music("Mesma Música", sender=artist)


def test_register_multiple_titles(music_contract, artist):
    music_contract.register_music("Música 1", sender=artist)
    music_contract.register_music("Música 2", sender=artist)
    assert music_contract.next_music_id() == 2


def test_payment_distribution(music_contract, artist):
    music_contract.register_music("Obra Pagável", sender=artist)
    music_id = 0

    # Simula alguém pagando royalties para a música
    payer = boa.env.generate_address("fã")
    boa.env.set_balance(payer, to_wei(1, "ether"))

    balance_before = boa.env.get_balance(artist)
    music_contract.pay_and_distribute(
        music_id, sender=payer, value=to_wei(0.1, "ether")
    )
    balance_after = boa.env.get_balance(artist)

    assert balance_after - balance_before == to_wei(0.1, "ether")


def test_pay_invalid_music_id(music_contract):
    payer = boa.env.generate_address("fã")
    boa.env.set_balance(payer, to_wei(1, "ether"))

    with boa.reverts():
        music_contract.pay_and_distribute(999, value=to_wei(0.1, "ether"), sender=payer)


def test_pay_without_value_fails(music_contract, artist):
    music_contract.register_music("Sem Dinheiro", sender=artist)
    with boa.reverts():
        music_contract.pay_and_distribute(0, value=0)
