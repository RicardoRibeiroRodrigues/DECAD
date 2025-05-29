# Map de músicas por ID
music_registry: public(HashMap[uint256, MusicWork])
music_hashes: public(HashMap[bytes32, bool])

# ID incremental para novas músicas
next_music_id: public(uint256)

# Estrutura para armazenar coautores e suas participações
# struct Contributor:
    # wallet: address
    # share: uint256  # Representa a porcentagem em pontos base (ex: 10000 = 100%)

# Estrutura para uma música registrada
struct MusicWork:
    title: String[100]
    artist: address
    # contributors: HashMap[uint256, Contributor]
    # contributor_count: uint256
    # total_shares: uint256  # Deve sempre ser 10000 (100%)
    exists: bool

@external
def register_music(title: String[100]):
    # Verifies if the (title, artist) pair is unique
    assert len(title) > 0, "Title cannot be empty"
    work_hash: bytes32 = self.get_hash(msg.sender, title)
    assert not self.music_hashes[work_hash], "Work already registered"

    work: MusicWork = MusicWork(title=title, artist=msg.sender, exists=True)
    
    self.music_registry[self.next_music_id] = work
    self.next_music_id += 1
    self.music_hashes[work_hash] = True

@payable
@external
def pay_and_distribute(music_id: uint256):
    work: MusicWork = self.music_registry[music_id]
    assert work.exists, "Work doesnt exist"
    assert msg.value > 0, "Must send a value greater than 0"

    send(work.artist, msg.value)


@pure
def get_hash(artist: address, title: String[100]) -> bytes32:
    return keccak256(
        # convert different data into Bytes
        concat(
            convert(artist, bytes32),
            convert(title, Bytes[100]),
        )
    )
    