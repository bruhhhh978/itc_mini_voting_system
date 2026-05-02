/// Proof of Contribution (POC) — on-chain task + contribution + reputation on Sui.
module itc_mini_voting_system::poc {
    use std::option::{Self, Option};
    use std::vector;
    use sui::object::{Self, ID, UID};
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // --- status ---
    const TASK_OPEN: u8 = 0;
    const TASK_IN_PROGRESS: u8 = 1;
    const TASK_DONE: u8 = 2;

    // --- errors ---
    const ENotOpen: u64 = 1;
    const ENotInProgress: u64 = 2;
    const ENotAssignee: u64 = 3;
    const ENotCreator: u64 = 4;
    const EAlreadyApproved: u64 = 5;
    const EWrongProfile: u64 = 6;
    const EProfileExists: u64 = 7;
    const EBadTaskId: u64 = 8;

    /// Shared registry: maps contributor address → shared Profile object id.
    public struct POCRegistry has key {
        id: UID,
        profiles: Table<address, ID>,
    }

    /// One shared profile per address (SBT-like reputation anchor).
    public struct Profile has key {
        id: UID,
        owner: address,
        reputation: u64,
        contributions: vector<ID>,
    }

    /// Team-visible task object (shared).
    public struct Task has key {
        id: UID,
        creator: address,
        description: vector<u8>,
        reward: u64,
        status: u8,
        assignee: Option<address>,
    }

    /// Proof submitted by assignee; transferred to task creator until approved.
    public struct Contribution has key {
        id: UID,
        task_id: ID,
        contributor: address,
        proof: vector<u8>,
        approved: bool,
    }

    fun init(ctx: &mut TxContext) {
        transfer::share_object(POCRegistry {
            id: object::new(ctx),
            profiles: table::new(ctx),
        });
    }

    /// Create a shared profile for `tx_context::sender` (one per address).
    public entry fun create_profile(registry: &mut POCRegistry, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(!table::contains(&registry.profiles, sender), EProfileExists);
        let profile = Profile {
            id: object::new(ctx),
            owner: sender,
            reputation: 0,
            contributions: vector::empty(),
        };
        let pid = object::id(&profile);
        transfer::share_object(profile);
        table::add(&mut registry.profiles, sender, pid);
    }

    /// Anyone can open a new task (team lead / DAO member).
    public entry fun create_task(description: vector<u8>, reward: u64, ctx: &mut TxContext) {
        let task = Task {
            id: object::new(ctx),
            creator: tx_context::sender(ctx),
            description,
            reward,
            status: TASK_OPEN,
            assignee: option::none(),
        };
        transfer::share_object(task);
    }

    /// Claim an open task.
    public entry fun claim_task(task: &mut Task, ctx: &TxContext) {
        assert!(task.status == TASK_OPEN, ENotOpen);
        task.status = TASK_IN_PROGRESS;
        task.assignee = option::some(tx_context::sender(ctx));
    }

    /// Assignee submits proof (URL / IPFS hash as raw bytes). Contribution object goes to task creator.
    public entry fun submit_contribution(task: &Task, proof: vector<u8>, ctx: &mut TxContext) {
        assert!(task.status == TASK_IN_PROGRESS, ENotInProgress);
        let sender = tx_context::sender(ctx);
        assert!(option::is_some(&task.assignee), ENotAssignee);
        assert!(*option::borrow(&task.assignee) == sender, ENotAssignee);
        let c = Contribution {
            id: object::new(ctx),
            task_id: object::id(task),
            contributor: sender,
            proof,
            approved: false,
        };
        transfer::transfer(c, task.creator);
    }

    /// Creator approves proof: marks contribution, completes task, bumps contributor reputation.
    public entry fun approve_contribution(
        contribution: &mut Contribution,
        task: &mut Task,
        profile: &mut Profile,
        ctx: &TxContext,
    ) {
        assert!(tx_context::sender(ctx) == task.creator, ENotCreator);
        assert!(contribution.task_id == object::id(task), EBadTaskId);
        assert!(!contribution.approved, EAlreadyApproved);
        assert!(profile.owner == contribution.contributor, EWrongProfile);
        contribution.approved = true;
        task.status = TASK_DONE;
        profile.reputation = profile.reputation + task.reward;
        vector::push_back(&mut profile.contributions, object::id(contribution));
    }
}
